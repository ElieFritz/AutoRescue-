import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RejectQuoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
