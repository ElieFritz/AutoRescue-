import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEmail, IsObject, Min, Max } from 'class-validator';

export class CreateGarageDto {
  @ApiProperty({ example: 'AutoService Express' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Rue de la Libert�' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Douala' })
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ default: 'Cameroun' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 4.0511, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 9.7085, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: '+237233456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@garage.cm' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: [String], example: ['European cars', 'Diagnostics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ type: [String], example: ['D�pannage', 'R�paration moteur'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  diagnosticFee?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFeePerKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;
}
