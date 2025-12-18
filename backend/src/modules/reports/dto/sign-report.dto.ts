import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SignReportDto {
  @ApiProperty()
  @IsUrl()
  signatureUrl: string;
}
