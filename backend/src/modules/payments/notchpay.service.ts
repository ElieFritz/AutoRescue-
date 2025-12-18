import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface NotchPayInitResponse {
  status: string;
  transaction: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    authorization_url: string;
  };
}

export interface NotchPayVerifyResponse {
  status: string;
  transaction: {
    reference: string;
    amount: number;
    currency: string;
    status: 'complete' | 'pending' | 'failed' | 'cancelled';
    customer: {
      email: string;
      phone: string;
    };
  };
}

@Injectable()
export class NotchPayService {
  private readonly logger = new Logger(NotchPayService.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('notchpay.apiUrl') || 'https://api.notchpay.co';
    this.publicKey = this.configService.get<string>('notchpay.publicKey') || '';
    this.secretKey = this.configService.get<string>('notchpay.secretKey') || '';
  }

  async initializePayment(params: {
    amount: number;
    currency: string;
    email: string;
    phone?: string;
    reference: string;
    description: string;
    callbackUrl: string;
  }): Promise<NotchPayInitResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/payments/initialize`,
          {
            amount: params.amount,
            currency: params.currency,
            email: params.email,
            phone: params.phone,
            reference: params.reference,
            description: params.description,
            callback: params.callbackUrl,
          },
          {
            headers: {
              Authorization: this.publicKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('NotchPay initialization failed', error.response?.data || error.message);
      throw new BadRequestException('Payment initialization failed');
    }
  }

  async verifyPayment(reference: string): Promise<NotchPayVerifyResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/payments/${reference}`, {
          headers: {
            Authorization: this.secretKey,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('NotchPay verification failed', error.response?.data || error.message);
      throw new BadRequestException('Payment verification failed');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = this.configService.get<string>('notchpay.webhookSecret');
    
    if (!webhookSecret) return false;

    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return computedSignature === signature;
  }
}
