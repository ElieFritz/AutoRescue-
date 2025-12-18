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
  // GARAGES MODULE
  'backend/src/modules/garages/garages.module.ts': `
import { Module } from '@nestjs/common';
import { GaragesService } from './garages.service';
import { GaragesController } from './garages.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GaragesController],
  providers: [GaragesService],
  exports: [GaragesService],
})
export class GaragesModule {}
`,

  'backend/src/modules/garages/garages.service.ts': `
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class GaragesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('garages')
      .select('*, owner:profiles(*)')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findNearby(lat: number, lng: number, radiusKm: number = 10) {
    const { data, error } = await this.supabase.client
      .rpc('find_nearby_garages', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm
      });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('garages')
      .select('*, owner:profiles(*), mechanics(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Garage non trouvé');
    return data;
  }

  async create(ownerId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('garages')
      .insert({ ...createData, owner_id: ownerId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, ownerId: string, updateData: any) {
    const { data, error } = await this.supabase.client
      .from('garages')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/garages/garages.controller.ts': `
import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GaragesService } from './garages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Garages')
@Controller('garages')
export class GaragesController {
  constructor(private readonly garagesService: GaragesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister tous les garages' })
  async findAll() {
    return this.garagesService.findAll();
  }

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'Trouver les garages à proximité' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.garagesService.findNearby(lat, lng, radius || 10);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un garage' })
  async findOne(@Param('id') id: string) {
    return this.garagesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('garage', 'admin')
  @ApiOperation({ summary: 'Créer un garage' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.garagesService.create(user.id, createData);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('garage', 'admin')
  @ApiOperation({ summary: 'Modifier un garage' })
  async update(@Param('id') id: string, @Body() updateData: any, @CurrentUser() user: any) {
    return this.garagesService.update(id, user.id, updateData);
  }
}
`,

  // MECHANICS MODULE
  'backend/src/modules/mechanics/mechanics.module.ts': `
import { Module } from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [MechanicsService],
})
export class MechanicsModule {}
`,

  'backend/src/modules/mechanics/mechanics.service.ts': `
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class MechanicsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByGarage(garageId: string) {
    const { data, error } = await this.supabase.client
      .from('mechanics')
      .select('*, user:profiles(*)')
      .eq('garage_id', garageId);

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('mechanics')
      .select('*, user:profiles(*), garage:garages(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Mécanicien non trouvé');
    return data;
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    const { data, error } = await this.supabase.client
      .from('mechanics')
      .update({ current_latitude: lat, current_longitude: lng })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(userId: string, status: string) {
    const { data, error } = await this.supabase.client
      .from('mechanics')
      .update({ status })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/mechanics/mechanics.controller.ts': `
import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mechanics')
@ApiBearerAuth('access-token')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get('garage/:garageId')
  @ApiOperation({ summary: 'Lister les mécaniciens d\\'un garage' })
  async findByGarage(@Param('garageId') garageId: string) {
    return this.mechanicsService.findByGarage(garageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un mécanicien' })
  async findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Patch('location')
  @Roles('mechanic')
  @ApiOperation({ summary: 'Mettre à jour ma position' })
  async updateLocation(
    @CurrentUser() user: any,
    @Body('latitude') lat: number,
    @Body('longitude') lng: number,
  ) {
    return this.mechanicsService.updateLocation(user.id, lat, lng);
  }

  @Patch('status')
  @Roles('mechanic')
  @ApiOperation({ summary: 'Mettre à jour mon statut' })
  async updateStatus(@CurrentUser() user: any, @Body('status') status: string) {
    return this.mechanicsService.updateStatus(user.id, status);
  }
}
`,

  // BREAKDOWNS MODULE
  'backend/src/modules/breakdowns/breakdowns.module.ts': `
import { Module } from '@nestjs/common';
import { BreakdownsService } from './breakdowns.service';
import { BreakdownsController } from './breakdowns.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BreakdownsController],
  providers: [BreakdownsService],
  exports: [BreakdownsService],
})
export class BreakdownsModule {}
`,

  'backend/src/modules/breakdowns/breakdowns.service.ts': `
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class BreakdownsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string, role: string) {
    let query = this.supabase.client
      .from('breakdowns')
      .select('*, motorist:profiles!motorist_id(*), vehicle:vehicles(*), garage:garages(*)')
      .order('created_at', { ascending: false });

    if (role === 'motorist') {
      query = query.eq('motorist_id', userId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('breakdowns')
      .select('*, motorist:profiles!motorist_id(*), vehicle:vehicles(*), garage:garages(*), mechanic:mechanics(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Demande non trouvée');
    return data;
  }

  async create(motoristId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('breakdowns')
      .insert({
        ...createData,
        motorist_id: motoristId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const { data, error } = await this.supabase.client
      .from('breakdowns')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async accept(id: string, garageId: string) {
    const { data, error } = await this.supabase.client
      .from('breakdowns')
      .update({
        garage_id: garageId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async cancel(id: string, userId: string, reason: string) {
    const { data, error } = await this.supabase.client
      .from('breakdowns')
      .update({
        status: 'cancelled',
        cancelled_by: userId,
        cancellation_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
`,

  'backend/src/modules/breakdowns/breakdowns.controller.ts': `
import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BreakdownsService } from './breakdowns.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Breakdowns')
@ApiBearerAuth('access-token')
@Controller('breakdowns')
export class BreakdownsController {
  constructor(private readonly breakdownsService: BreakdownsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister mes demandes de dépannage' })
  async findAll(@CurrentUser() user: any) {
    return this.breakdownsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une demande' })
  async findOne(@Param('id') id: string) {
    return this.breakdownsService.findOne(id);
  }

  @Post()
  @Roles('motorist')
  @ApiOperation({ summary: 'Créer une demande de dépannage' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.breakdownsService.create(user.id, createData);
  }

  @Patch(':id/accept')
  @Roles('garage', 'admin')
  @ApiOperation({ summary: 'Accepter une demande' })
  async accept(@Param('id') id: string, @CurrentUser() user: any) {
    // Get garage owned by user
    return this.breakdownsService.accept(id, user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Annuler une demande' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.breakdownsService.cancel(id, user.id, reason);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.breakdownsService.updateStatus(id, status, user.id);
  }
}
`,
};

Object.entries(files).forEach(([filePath, content]) => {
  createFile(filePath, content);
});

console.log('\\n? Garages, Mechanics, Breakdowns modules created!');
