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
