import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255)
  title: string;

  // description — необязательное поле
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
