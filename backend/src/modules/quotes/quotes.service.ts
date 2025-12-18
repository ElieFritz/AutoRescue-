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
