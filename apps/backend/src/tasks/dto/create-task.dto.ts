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

  @IsUUID()
  @IsNotEmpty()
  boardId: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  // Исполнитель необязателен
  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
