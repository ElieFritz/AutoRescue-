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
