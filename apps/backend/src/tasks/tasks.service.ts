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
   * Возвращает задачи доски (если передан boardId) или все задачи пользователя.
   * Только участники доски видят её задачи.
   */
  async findAll(userId: string, query: GetTasksDto): Promise<Task[]> {
    // Если boardId не передан — возвращаем задачи из всех досок пользователя
    const boardFilter = query.boardId
      ? {
          boardId: query.boardId,
          board: { members: { some: { userId } } },
        }
      : {
          board: { members: { some: { userId } } },
        };

    return this.prisma.task.findMany({
      where: {
        ...boardFilter,
        ...(query.status && { status: query.status }),
      },
      include: {
        labels: { include: { label: true } },
        assignee: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Создаёт задачу в указанной доске.
   * Проверяем, что пользователь является участником доски.
   */
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    // Проверяем членство в доске
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: dto.boardId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('Нет доступа к этой доске');
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        userId,
        boardId: dto.boardId,
      },
      include: {
        labels: { include: { label: true } },
        assignee: { select: { id: true, email: true } },
      },
    });
  }

  /**
   * Обновляет задачу. После успеха эмитит WebSocket событие task:updated
   * в комнату доски, чтобы все участники получили обновление в реальном времени.
   */
  async update(taskId: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findAccessibleTask(taskId, userId);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
      },
    });

    this.gateway.emitTaskUpdated(updated);
    return updated;
  }

  /**
   * Удаляет задачу. Может удалить только автор задачи.
   */
  async remove(taskId: string, userId: string): Promise<Task> {
    await this.findOwnedTask(taskId, userId);
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  // Участник доски может обновить любую задачу в ней
  private async findAccessibleTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task "${taskId}" not found`);

    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: task.boardId, userId } },
    });
    if (!member) throw new ForbiddenException('Нет доступа к этой задаче');

    return task;
  }

  // Удалить может только автор задачи
  private async findOwnedTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task "${taskId}" not found`);
    if (task.userId !== userId) throw new ForbiddenException('Нет прав для удаления этой задачи');
    return task;
  }
}
