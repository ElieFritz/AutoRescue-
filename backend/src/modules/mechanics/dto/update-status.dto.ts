import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MechanicStatus } from '../../../common/enums';

export class UpdateStatusDto {
  @ApiProperty({ enum: MechanicStatus })
  @IsEnum(MechanicStatus)
  status: MechanicStatus;
}
