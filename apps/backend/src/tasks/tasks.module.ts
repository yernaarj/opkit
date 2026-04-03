import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksGateway } from './tasks.gateway';

/**
 * TasksModule — управление задачами + WebSocket gateway с авторизацией.
 *
 * JwtModule импортируем здесь чтобы TasksGateway мог верифицировать
 * токен при WS подключении независимо от AuthModule.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksGateway],
})
export class TasksModule {}
