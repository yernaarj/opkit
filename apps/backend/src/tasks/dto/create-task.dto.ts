import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  // boardId обязателен — задача всегда привязана к доске
  @IsUUID()
  @IsNotEmpty()
  boardId: string;

  // Приоритет необязателен — по умолчанию MEDIUM (задан в schema)
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
