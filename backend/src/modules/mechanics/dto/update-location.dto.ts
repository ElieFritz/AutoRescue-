import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 4.0511 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 9.7085 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
