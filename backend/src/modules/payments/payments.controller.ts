import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lister mes paiements' })
  async findAll(@CurrentUser() user: any) {
    return this.paymentsService.findByUser(user.id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initier un paiement' })
  async initiate(@Body() createData: any, @CurrentUser() user: any) {
    return this.paymentsService.initiate(user.id, createData);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook NotchPay' })
  async webhook(@Body() body: any) {
    // Handle NotchPay webhook
    console.log('Payment webhook received:', body);
    return { received: true };
  }
}
