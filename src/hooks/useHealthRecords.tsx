import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HealthRecord {
  id: string;
  user_id: string;
  cycle_id?: string;
  unit_id: string;
  basin_id?: string;
  date: string;
  temperature?: number;
  ph?: number;
  oxygen?: number;
  density?: number;
  mortality?: number;
  feeding?: number;
  average_weight?: number;
  sample_count?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useHealthRecords = (cycleId?: string, unitId?: string) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('health_records')
        .select('*')
        .order('date', { ascending: false });

      if (cycleId) {
        query = query.eq('cycle_id', cycleId as any);
      }

      if (unitId) {
        query = query.eq('unit_id', unitId as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setRecords(data as unknown as HealthRecord[]);
      }
    } catch (error: any) {
      console.error('Error fetching health records:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les enregistrements de santé',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [cycleId, unitId]);

  const createRecord = async (record: Omit<HealthRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('health_records')
        .insert([{ ...record, user_id: user.id }] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement de santé créé',
      });

      await fetchRecords();
      return data;
    } catch (error: any) {
      console.error('Error creating health record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'enregistrement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: Partial<HealthRecord>) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .update(updates)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement mis à jour',
      });

      await fetchRecords();
    } catch (error: any) {
      console.error('Error updating record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'enregistrement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement supprimé',
      });

      await fetchRecords();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'enregistrement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    records,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
};
