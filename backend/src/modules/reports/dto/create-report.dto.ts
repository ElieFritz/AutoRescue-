import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsArray, IsOptional, IsIn } from 'class-validator';

export class CreateReportDto {
  @ApiProperty()
  @IsUUID()
  breakdownId: string;

  @ApiProperty({ enum: ['diagnostic', 'intermediate', 'final'] })
  @IsString()
  @IsIn(['diagnostic', 'intermediate', 'final'])
  reportType: string;

  @ApiProperty({ example: 'Rapport de diagnostic' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}
