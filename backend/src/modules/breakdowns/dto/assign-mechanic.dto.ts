import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignMechanicDto {
  @ApiProperty()
  @IsUUID()
  mechanicId: string;
}
