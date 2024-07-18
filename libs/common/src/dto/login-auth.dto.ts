import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsNumber()
  providerTypeId: number;

  @IsString()
  @IsOptional()
  password?: string;
}
