import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('breakdown/:breakdownId')
  @ApiOperation({ summary: 'Obtenir les rapports d\'une panne' })
  async findByBreakdown(@Param('breakdownId') breakdownId: string) {
    return this.reportsService.findByBreakdown(breakdownId);
  }

  @Post()
  @Roles(UserRole.MECHANIC)
  @ApiOperation({ summary: 'Créer un rapport' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.reportsService.create(user.id, createData);
  }
}
