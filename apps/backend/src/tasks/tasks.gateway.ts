import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import type { Task } from '@prisma/client';

export interface TaskUpdatedPayload {
  id: string;
  status: string;
  title: string;
  timestamp: string;
}

/**
 * TasksGateway — WebSocket сервер с авторизацией и изолированными rooms.
 *
 * Авторизация при подключении:
 *   Клиент передаёт JWT в handshake: io(url, { auth: { token } })
 *   Gateway верифицирует токен и кладёт userId в socket.data.userId.
 *   Если токен невалидный — соединение разрывается с ошибкой.
 *
 * Rooms (изоляция по пользователям):
 *   После авторизации каждый сокет вступает в комнату `user:<userId>`.
 *   emitTaskUpdated отправляет событие только в комнату владельца задачи —
 *   другие пользователи события не получают.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TasksGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TasksGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async afterInit(server: Server): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisUrl = `redis://${redisHost}:${redisPort}`;

    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    server.adapter(createAdapter(pubClient, subClient));

    /**
     * Socket.IO middleware — выполняется ДО установки соединения.
     * Здесь правильное место для проверки авторизации:
     * если вызвать next(error) — соединение не устанавливается вообще.
     *
     * handleConnection() вызывается ПОСЛЕ установки — там уже поздно блокировать.
     */
    server.use((socket, next) => {
      try {
        const raw =
          socket.handshake.auth?.token ||
          socket.handshake.query?.token;

        if (!raw) throw new UnauthorizedException('No token provided');

        const token = typeof raw === 'string'
          ? raw.replace(/^Bearer\s+/i, '')
          : (raw as string[])[0].replace(/^Bearer\s+/i, '');

        const payload = this.jwtService.verify<{ sub: string; email: string }>(token);

        // Кладём userId в socket.data — доступен в handleConnection и далее
        socket.data.userId = payload.sub;

        next();
      } catch {
        next(new UnauthorizedException('Invalid or missing token'));
      }
    });

    this.logger.log(`WebSocket initialized with Redis adapter (${redisUrl})`);
  }

  /**
   * Вызывается после успешного прохождения middleware.
   * Здесь userId уже верифицирован — просто вступаем в room.
   */
  async handleConnection(client: Socket): Promise<void> {
    const room = `user:${client.data.userId}`;
    await client.join(room);
    this.logger.log(`Client connected: ${client.id} → room ${room}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId ?? 'unknown';
    this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
  }

  /**
   * Отправляет task:updated только в комнату владельца задачи.
   * Другие пользователи события не получают.
   */
  emitTaskUpdated(task: Task): void {
    const payload: TaskUpdatedPayload = {
      id: task.id,
      status: task.status,
      title: task.title,
      timestamp: new Date().toISOString(),
    };

    // Отправляем только в комнату владельца задачи
    const room = `user:${task.userId}`;
    this.server.to(room).emit('task:updated', payload);

    this.logger.log(`Emitted task:updated → room ${room} (task: ${task.id})`);
  }
}
