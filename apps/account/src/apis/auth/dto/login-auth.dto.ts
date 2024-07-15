import { IsOptional, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  password?: string;
}
