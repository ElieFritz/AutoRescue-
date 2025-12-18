import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class MechanicsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string) {
    // Get user's garage first
    const { data: garage } = await this.supabase.admin
      .from('garages')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (garage) {
      // Return mechanics from user's garage
      const { data, error } = await this.supabase.admin
        .from('mechanics')
        .select('*, user:profiles(*)')
        .eq('garage_id', garage.id);

      if (error) {
        console.error('Error fetching mechanics:', error);
        return [];
      }
      return data || [];
    }

    // Return empty if user doesn't own a garage
    return [];
  }

  async findByUserId(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('mechanics')
      .select('*, user:profiles(*), garage:garages(*)')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  }

  async findByGarage(garageId: string) {
    const { data, error } = await this.supabase.admin
      .from('mechanics')
      .select('*, user:profiles(*)')
      .eq('garage_id', garageId);

    if (error) {
      console.error('Error fetching mechanics by garage:', error);
      return [];
    }
    return data || [];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('mechanics')
      .select('*, user:profiles(*), garage:garages(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Mecanicien non trouve');
    return data;
  }

  async invite(ownerId: string, inviteData: any) {
    // Get owner's garage
    const { data: garage } = await this.supabase.admin
      .from('garages')
      .select('id')
      .eq('owner_id', ownerId)
      .single();

    if (!garage) {
      throw new BadRequestException('Vous devez avoir un garage pour inviter des mecaniciens');
    }

    // In a real app, this would:
    // 1. Create an invitation record
    // 2. Send an email to the mechanic
    // For now, just return success
    console.log('Invitation data:', { garage_id: garage.id, ...inviteData });

    return {
      success: true,
      message: 'Invitation envoyee',
      invitation: {
        email: inviteData.email,
        garage_id: garage.id,
      }
    };
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    const { data, error } = await this.supabase.admin
      .from('mechanics')
      .update({ 
        current_latitude: lat, 
        current_longitude: lng,
        last_location_update: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async updateStatus(userId: string, status: string) {
    const validStatuses = ['available', 'busy', 'unavailable', 'offline'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Statut invalide');
    }

    const { data, error } = await this.supabase.admin
      .from('mechanics')
      .update({ status })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating status:', error);
      throw new BadRequestException(error.message);
    }
    return data;
  }
}
