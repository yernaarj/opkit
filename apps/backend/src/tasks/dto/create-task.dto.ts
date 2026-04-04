import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

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
}
