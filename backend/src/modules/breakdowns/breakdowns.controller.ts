import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BreakdownsService } from './breakdowns.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Breakdowns')
@ApiBearerAuth('access-token')
@Controller('breakdowns')
export class BreakdownsController {
  constructor(private readonly breakdownsService: BreakdownsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les demandes de dépannage (filtrées par rôle)' })
  async findAll(@CurrentUser() user: any) {
    return this.breakdownsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une demande' })
  async findOne(@Param('id') id: string) {
    return this.breakdownsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une demande de dépannage (motoriste)' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.breakdownsService.create(user.id, createData);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accepter une demande (garage)' })
  async accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.breakdownsService.accept(id, user.id);
  }

  @Patch(':id/assign-mechanic')
  @ApiOperation({ summary: 'Assigner un mécanicien (garage)' })
  async assignMechanic(
    @Param('id') id: string,
    @Body() body: { mechanicId: string },
    @CurrentUser() user: any,
  ) {
    return this.breakdownsService.assignMechanic(id, body.mechanicId, user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Annuler une demande' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.breakdownsService.cancel(id, user.id, body?.reason || '');
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.breakdownsService.updateStatus(id, body.status, user.id);
  }
}
