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
