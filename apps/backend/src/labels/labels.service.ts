import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  // Возвращает все лейблы доски (доступно всем участникам)
  async findAll(boardId: string, userId: string) {
    await this.assertMember(boardId, userId);
    return this.prisma.label.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Создаёт лейбл — только владелец доски
  async create(boardId: string, userId: string, dto: CreateLabelDto) {
    await this.assertOwner(boardId, userId);

    const exists = await this.prisma.label.findUnique({
      where: { boardId_name: { boardId, name: dto.name } },
    });
    if (exists) throw new ConflictException(`Лейбл "${dto.name}" уже существует`);

    return this.prisma.label.create({
      data: { name: dto.name, color: dto.color, boardId },
    });
  }

  // Удаляет лейбл — только владелец доски
  async remove(boardId: string, labelId: string, userId: string) {
    await this.assertOwner(boardId, userId);
    const label = await this.prisma.label.findUnique({ where: { id: labelId } });
    if (!label || label.boardId !== boardId) throw new NotFoundException('Лейбл не найден');
    await this.prisma.label.delete({ where: { id: labelId } });
  }

  // Привязывает лейбл к задаче
  async addToTask(taskId: string, labelId: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Задача не найдена');
    await this.assertMember(task.boardId, userId);

    const label = await this.prisma.label.findUnique({ where: { id: labelId } });
    if (!label || label.boardId !== task.boardId) {
      throw new ForbiddenException('Лейбл не принадлежит этой доске');
    }

    try {
      await this.prisma.taskLabel.create({ data: { taskId, labelId } });
    } catch {
      throw new ConflictException('Лейбл уже добавлен к задаче');
    }
  }

  // Удаляет лейбл с задачи
  async removeFromTask(taskId: string, labelId: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Задача не найдена');
    await this.assertMember(task.boardId, userId);

    await this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  private async assertMember(boardId: string, userId: string) {
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) throw new ForbiddenException('Нет доступа к этой доске');
  }

  private async assertOwner(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Доска не найдена');
    if (board.ownerId !== userId) throw new ForbiddenException('Только владелец может управлять лейблами');
  }
}
