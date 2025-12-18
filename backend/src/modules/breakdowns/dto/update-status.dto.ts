import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BreakdownStatus } from '../../../common/enums';

export class UpdateBreakdownStatusDto {
  @ApiProperty({ enum: BreakdownStatus })
  @IsEnum(BreakdownStatus)
  status: BreakdownStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
