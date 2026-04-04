import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  // Возвращает все доски, в которых пользователь является участником
  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        owner: { select: { id: true, email: true } },
        members: {
          include: { user: { select: { id: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Создаёт доску и сразу добавляет создателя как участника
  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        ownerId: userId,
        members: {
          create: { userId }, // владелец = первый участник
        },
      },
      include: {
        owner: { select: { id: true, email: true } },
        members: {
          include: { user: { select: { id: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  // Удаляет доску; только владелец может удалить
  async remove(boardId: string, userId: string) {
    const board = await this.findOneOrFail(boardId, userId);
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может удалить доску');
    }
    await this.prisma.board.delete({ where: { id: boardId } });
  }

  // Приглашает участника по email
  async inviteMember(boardId: string, userId: string, dto: InviteMemberDto) {
    const board = await this.findOneOrFail(boardId, userId);
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может приглашать участников');
    }

    const invitee = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });
    if (!invitee) {
      throw new NotFoundException(`Пользователь ${dto.email} не найден`);
    }

    const already = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: invitee.id } },
    });
    if (already) {
      throw new ConflictException('Пользователь уже является участником доски');
    }

    await this.prisma.boardMember.create({
      data: { boardId, userId: invitee.id },
    });

    return invitee;
  }

  // Удаляет участника из доски; только владелец или сам участник
  async removeMember(boardId: string, requesterId: string, memberId: string) {
    const board = await this.findOneOrFail(boardId, requesterId);
    const isOwner = board.ownerId === requesterId;
    const isSelf = requesterId === memberId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('Нет прав для удаления участника');
    }
    if (isOwner && memberId === requesterId) {
      throw new ForbiddenException('Владелец не может покинуть свою доску');
    }

    await this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId: memberId } },
    });
  }

  // Проверяет существование доски и членство пользователя
  async findOneOrFail(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });
    if (!board) throw new NotFoundException('Доска не найдена');

    const isMember = board.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Нет доступа к этой доске');

    return board;
  }
}
