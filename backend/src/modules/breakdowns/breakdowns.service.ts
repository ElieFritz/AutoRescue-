import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class BreakdownsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string, role: string) {
    let query = this.supabase.admin
      .from('breakdowns')
      .select('*, motorist:profiles!motorist_id(*), vehicle:vehicles(*), garage:garages(*), mechanic:mechanics(*)')
      .order('created_at', { ascending: false });

    if (role === 'motorist') {
      // Motorists see their own breakdowns
      query = query.eq('motorist_id', userId);
    } else if (role === 'garage') {
      // Garages see breakdowns assigned to them OR pending ones nearby
      const { data: garage } = await this.supabase.admin
        .from('garages')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (garage) {
        query = query.or(`garage_id.eq.${garage.id},status.eq.pending`);
      }
    } else if (role === 'mechanic') {
      // Mechanics see breakdowns assigned to them
      const { data: mechanic } = await this.supabase.admin
        .from('mechanics')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (mechanic) {
        query = query.eq('mechanic_id', mechanic.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching breakdowns:', error);
      return [];
    }
    return data || [];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .select('*, motorist:profiles!motorist_id(*), vehicle:vehicles(*), garage:garages(*), mechanic:mechanics(*, user:profiles(*))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Demande non trouvee');
    return data;
  }

  async create(motoristId: string, createData: any) {
    const insertData: any = {
      motorist_id: motoristId,
      status: 'pending',
      title: createData.title || 'Demande de depannage',
      description: createData.description || '',
      breakdown_type: createData.breakdownType || createData.breakdown_type || 'other',
      latitude: createData.latitude || createData.location?.lat,
      longitude: createData.longitude || createData.location?.lng,
      address: createData.address || createData.location?.address || '',
    };

    if (createData.vehicleId || createData.vehicle_id) {
      insertData.vehicle_id = createData.vehicleId || createData.vehicle_id;
    }
    if (createData.garageId || createData.garage_id) {
      insertData.garage_id = createData.garageId || createData.garage_id;
    }
    if (createData.photos) {
      insertData.photos = createData.photos;
    }

    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating breakdown:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating status:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async accept(id: string, userId: string) {
    // Get user's garage
    const { data: garage, error: garageError } = await this.supabase.admin
      .from('garages')
      .select('id, name, diagnostic_fee, travel_fee')
      .eq('owner_id', userId)
      .single();

    if (garageError || !garage) {
      throw new BadRequestException('Vous devez avoir un garage pour accepter des demandes');
    }

    // Check if breakdown is still pending
    const { data: breakdown } = await this.supabase.admin
      .from('breakdowns')
      .select('status')
      .eq('id', id)
      .single();

    if (breakdown?.status !== 'pending') {
      throw new BadRequestException('Cette demande a deja ete prise en charge');
    }

    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .update({
        garage_id: garage.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        diagnostic_fee: garage.diagnostic_fee || 5000,
        travel_fee: garage.travel_fee || 2000,
      })
      .eq('id', id)
      .select('*, garage:garages(*)')
      .single();

    if (error) {
      console.error('Error accepting breakdown:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async assignMechanic(id: string, mechanicId: string, userId: string) {
    // Get user's garage
    const { data: garage } = await this.supabase.admin
      .from('garages')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (!garage) {
      throw new ForbiddenException('Vous devez avoir un garage pour assigner un mecanicien');
    }

    // Verify mechanic belongs to this garage
    const { data: mechanic } = await this.supabase.admin
      .from('mechanics')
      .select('id, garage_id')
      .eq('id', mechanicId)
      .single();

    if (!mechanic || mechanic.garage_id !== garage.id) {
      throw new ForbiddenException('Ce mecanicien n\'appartient pas a votre garage');
    }

    // Verify breakdown belongs to this garage
    const { data: breakdown } = await this.supabase.admin
      .from('breakdowns')
      .select('garage_id')
      .eq('id', id)
      .single();

    if (!breakdown || breakdown.garage_id !== garage.id) {
      throw new ForbiddenException('Cette demande n\'est pas assignee a votre garage');
    }

    // Update breakdown
    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .update({
        mechanic_id: mechanicId,
        status: 'mechanic_assigned',
      })
      .eq('id', id)
      .select('*, mechanic:mechanics(*, user:profiles(*))')
      .single();

    if (error) {
      console.error('Error assigning mechanic:', error);
      throw new BadRequestException(error.message);
    }

    // Update mechanic status to busy
    await this.supabase.admin
      .from('mechanics')
      .update({ status: 'busy' })
      .eq('id', mechanicId);

    return data;
  }

  async cancel(id: string, userId: string, reason: string) {
    const { data, error } = await this.supabase.admin
      .from('breakdowns')
      .update({
        status: 'cancelled',
        cancelled_by: userId,
        cancellation_reason: reason || 'Annule par l\'utilisateur'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling breakdown:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }
}
