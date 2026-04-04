import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksGateway } from './tasks.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import type { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TasksGateway,
  ) {}

  /**
   * Возвращает задачи текущего пользователя.
   * Если передан query.status — фильтруем по нему.
   * Пример: GET /api/tasks?status=TODO
   */
  async findAll(userId: string, query: GetTasksDto): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        // status undefined → Prisma игнорирует фильтр, возвращает все задачи
        ...(query.status && { status: query.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Создаёт задачу и сразу привязывает к пользователю.
   * Статус по умолчанию — TODO (задан в schema.prisma).
   */
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId,
      },
    });
  }

  /**
   * Обновляет задачу (title, description, status).
   * После успешного обновления эмитит WebSocket событие task:updated
   * всем подключённым клиентам — это и есть real-time обновление.
   */
  async update(
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    await this.findOwnedTask(taskId, userId);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        // undefined-поля Prisma игнорирует — обновляем только то, что пришло
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    // Уведомляем всех подключённых клиентов об изменении задачи
    this.gateway.emitTaskUpdated(updated);

    return updated;
  }

  /**
   * Удаляет задачу.
   * Проверяем владельца перед удалением.
   */
  async remove(taskId: string, userId: string): Promise<Task> {
    await this.findOwnedTask(taskId, userId);
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  /**
   * Вспомогательный метод — находит задачу и проверяет владельца.
   * Выбрасывает 404 если задача не найдена, 403 если чужая.
   */
  private async findOwnedTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with id "${taskId}" not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }
}
