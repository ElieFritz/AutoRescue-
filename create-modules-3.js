const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`Created: ${filePath}`);
}

const files = {
  // QUOTES MODULE
  'backend/src/modules/quotes/quotes.module.ts': `
import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
`,

  'backend/src/modules/quotes/quotes.service.ts': `
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class QuotesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByBreakdown(breakdownId: string) {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .select('*, mechanic:mechanics(*, user:profiles(*))')
      .eq('breakdown_id', breakdownId);

    if (error) throw new Error(error.message);
    return data;
  }

  async create(mechanicId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .insert({ ...createData, mechanic_id: mechanicId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async accept(id: string) {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async reject(id: string, reason: string) {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/quotes/quotes.controller.ts': `
import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Quotes')
@ApiBearerAuth('access-token')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('breakdown/:breakdownId')
  @ApiOperation({ summary: 'Obtenir les devis d\\'une panne' })
  async findByBreakdown(@Param('breakdownId') breakdownId: string) {
    return this.quotesService.findByBreakdown(breakdownId);
  }

  @Post()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Créer un devis' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.quotesService.create(user.id, createData);
  }

  @Patch(':id/accept')
  @Roles('motorist')
  @ApiOperation({ summary: 'Accepter un devis' })
  async accept(@Param('id') id: string) {
    return this.quotesService.accept(id);
  }

  @Patch(':id/reject')
  @Roles('motorist')
  @ApiOperation({ summary: 'Refuser un devis' })
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.quotesService.reject(id, reason);
  }
}
`,

  // PAYMENTS MODULE
  'backend/src/modules/payments/payments.module.ts': `
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
`,

  'backend/src/modules/payments/payments.service.ts': `
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByUser(userId: string) {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select('*, breakdown:breakdowns(*)')
      .eq('payer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async initiate(payerId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('payments')
      .insert({ ...createData, payer_id: payerId, status: 'pending' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id: string, status: string, providerResponse?: any) {
    const updateData: any = { status };
    if (status === 'completed') updateData.paid_at = new Date().toISOString();
    if (providerResponse) updateData.provider_response = providerResponse;

    const { data, error } = await this.supabase.client
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/payments/payments.controller.ts': `
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
`,

  // REPORTS MODULE
  'backend/src/modules/reports/reports.module.ts': `
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
`,

  'backend/src/modules/reports/reports.service.ts': `
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByBreakdown(breakdownId: string) {
    const { data, error } = await this.supabase.client
      .from('reports')
      .select('*, mechanic:mechanics(*, user:profiles(*))')
      .eq('breakdown_id', breakdownId);

    if (error) throw new Error(error.message);
    return data;
  }

  async create(mechanicId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('reports')
      .insert({ ...createData, mechanic_id: mechanicId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/reports/reports.controller.ts': `
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('breakdown/:breakdownId')
  @ApiOperation({ summary: 'Obtenir les rapports d\\'une panne' })
  async findByBreakdown(@Param('breakdownId') breakdownId: string) {
    return this.reportsService.findByBreakdown(breakdownId);
  }

  @Post()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Créer un rapport' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.reportsService.create(user.id, createData);
  }
}
`,

  // NOTIFICATIONS MODULE
  'backend/src/modules/notifications/notifications.module.ts': `
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
`,

  'backend/src/modules/notifications/notifications.service.ts': `
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByUser(userId: string) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data;
  }

  async markAsRead(id: string, userId: string) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async create(userId: string, notification: { title: string; message: string; type: string }) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .insert({ user_id: userId, ...notification })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/notifications/notifications.controller.ts': `
import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister mes notifications' })
  async findAll(@CurrentUser() user: any) {
    return this.notificationsService.findByUser(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer comme lu' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
`,

  'backend/src/modules/notifications/notifications.gateway.ts': `
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(client.id, userId);
      client.join(\`user_\${userId}\`);
      console.log(\`User \${userId} connected\`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(\`User \${userId} disconnected\`);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(\`user_\${userId}\`).emit(event, data);
  }

  broadcastBreakdownUpdate(breakdownId: string, data: any) {
    this.server.emit(\`breakdown_\${breakdownId}\`, data);
  }
}
`,
};

Object.entries(files).forEach(([filePath, content]) => {
  createFile(filePath, content);
});

console.log('\\n? Quotes, Payments, Reports, Notifications modules created!');
