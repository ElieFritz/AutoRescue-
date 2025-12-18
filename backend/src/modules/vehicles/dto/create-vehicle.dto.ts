import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { VehicleType } from '../../../common/enums';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional({ example: 'LT 1234 AB' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({ enum: VehicleType, default: VehicleType.CAR })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ example: 'Silver' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ example: 'Petrol' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
