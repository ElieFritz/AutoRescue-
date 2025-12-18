import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Mechanics')
@ApiBearerAuth('access-token')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les mécaniciens' })
  async findAll(@CurrentUser() user: any) {
    return this.mechanicsService.findAll(user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtenir mon profil mécanicien' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.mechanicsService.findByUserId(user.id);
  }

  @Get('garage/:garageId')
  @ApiOperation({ summary: 'Lister les mécaniciens d\'un garage' })
  async findByGarage(@Param('garageId') garageId: string) {
    return this.mechanicsService.findByGarage(garageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un mécanicien' })
  async findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Inviter un mécanicien' })
  async invite(@Body() inviteData: any, @CurrentUser() user: any) {
    return this.mechanicsService.invite(user.id, inviteData);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Mettre à jour ma position' })
  async updateLocation(
    @CurrentUser() user: any,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.mechanicsService.updateLocation(user.id, body.latitude, body.longitude);
  }

  @Patch('status')
  @ApiOperation({ summary: 'Mettre à jour mon statut' })
  async updateStatus(@CurrentUser() user: any, @Body() body: { status: string }) {
    return this.mechanicsService.updateStatus(user.id, body.status);
  }
}
