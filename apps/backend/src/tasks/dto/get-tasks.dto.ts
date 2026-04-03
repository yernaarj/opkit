import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@prisma/client';

/**
 * Query-параметры для GET /tasks
 * Пример: GET /api/tasks?status=TODO
 *
 * Если status не передан — возвращаем все задачи пользователя.
 */
export class GetTasksDto {
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  @IsOptional()
  status?: TaskStatus;
}
