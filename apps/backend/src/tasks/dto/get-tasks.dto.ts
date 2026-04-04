import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskStatus } from '@prisma/client';

/**
 * Query-параметры для GET /tasks
 * Примеры:
 *   GET /api/tasks?boardId=uuid
 *   GET /api/tasks?boardId=uuid&status=TODO
 */
export class GetTasksDto {
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  @IsOptional()
  status?: TaskStatus;

  // Фильтр по доске — если не передан, возвращаем задачи из всех досок
  @IsUUID()
  @IsOptional()
  boardId?: string;
}
