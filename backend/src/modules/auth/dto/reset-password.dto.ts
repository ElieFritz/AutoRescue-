import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  newPassword: string;

  @ApiProperty({ description: 'Token de reinitialisation (depuis le lien email)' })
  @IsString()
  accessToken: string;
}
