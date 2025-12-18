import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';
import { PaymentType } from '../../../common/enums';

export class InitiatePaymentDto {
  @ApiProperty()
  @IsUUID()
  breakdownId: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType: PaymentType;
}
