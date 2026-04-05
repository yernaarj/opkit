import { IsString, MinLength, MaxLength, IsHexColor, IsOptional } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
