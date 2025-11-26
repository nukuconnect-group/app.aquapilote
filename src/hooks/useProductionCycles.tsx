import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductionCycle {
  id: string;
  user_id: string;
  unit_id: string;
  unit_name: string;
  unit_type: string;
  name: string;
  status: string;
  start_date: string;
  end_date?: string;
  current_quantity: number;
  target_quantity: number;
  initial_quantity?: number;
  fingerlings_count?: number;
  stocking_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  species?: string;
  duration_months?: number;
}

export const useProductionCycles = (unitId?: string) => {
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCycles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('production_cycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setCycles(data as unknown as ProductionCycle[]);
      }
    } catch (error: any) {
      console.error('Error fetching cycles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les cycles de production',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, [unitId]);

  const createCycle = async (cycle: Omit<ProductionCycle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('production_cycles')
        .insert([{ ...cycle, user_id: user.id }] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Cycle de production créé avec succès',
      });

      await fetchCycles();
      return data as unknown as ProductionCycle;
    } catch (error: any) {
      console.error('Error creating cycle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le cycle de production',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCycle = async (id: string, updates: Partial<ProductionCycle>) => {
    try {
      const { error } = await supabase
        .from('production_cycles')
        .update(updates)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Cycle de production mis à jour',
      });

      await fetchCycles();
    } catch (error: any) {
      console.error('Error updating cycle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le cycle',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteCycle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('production_cycles')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Cycle de production supprimé',
      });

      await fetchCycles();
    } catch (error: any) {
      console.error('Error deleting cycle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le cycle',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    cycles,
    loading,
    createCycle,
    updateCycle,
    deleteCycle,
    refetch: fetchCycles,
  };
};
