import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email du compte' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}
