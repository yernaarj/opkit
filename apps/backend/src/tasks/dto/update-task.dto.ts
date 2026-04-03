import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { CreateTaskDto } from './create-task.dto';

/**
 * UpdateTaskDto — все поля из CreateTaskDto становятся необязательными.
 * PartialType избавляет от дублирования: title?, description? — автоматически.
 *
 * Дополнительно добавляем поле status для смены статуса задачи.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, DONE',
  })
  @IsOptional()
  status?: TaskStatus;
}
