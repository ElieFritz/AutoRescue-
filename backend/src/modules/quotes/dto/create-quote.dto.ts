import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsArray, IsOptional, IsString, Min, IsDateString } from 'class-validator';

export class QuoteItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateQuoteDto {
  @ApiProperty()
  @IsUUID()
  breakdownId: string;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  items: QuoteItemDto[];

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  laborCost: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  partsCost: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
