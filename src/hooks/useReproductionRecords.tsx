import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuthReady } from '@/hooks/useAuthReady';

export interface ReproductionRecord {
  id: string;
  user_id: string;
  unit_id: string;
  unit_name: string;
  species: string;
  broodstock_male_count: number;
  broodstock_female_count: number;
  broodstock_batch_id: string | null;
  reproduction_date: string;
  reproduction_method: string;
  hormone_used: string | null;
  hormone_dose: number | null;
  spawning_date: string | null;
  egg_count: number | null;
  spawning_rate: number | null;
  fertilization_rate: number | null;
  incubation_start_date: string | null;
  incubation_temperature: number | null;
  hatching_date: string | null;
  hatching_rate: number | null;
  larvae_count: number | null;
  larvae_transfer_date: string | null;
  fry_count: number | null;
  survival_rate: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useReproductionRecords = (unitId?: string) => {
  const [records, setRecords] = useState<ReproductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isReady, isAuthenticated } = useAuthReady();

  const fetchRecords = useCallback(async () => {
    if (!isReady) return;
    
    if (!isAuthenticated) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('reproduction_records')
        .select('*')
        .order('reproduction_date', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        throw fetchError;
      }
      
      setRecords((data || []) as ReproductionRecord[]);
    } catch (err: any) {
      console.error('Error fetching reproduction records:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les enregistrements de reproduction',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isReady, isAuthenticated, unitId, toast]);

  const createRecord = async (record: Omit<ReproductionRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reproduction_records')
        .insert([{ ...record, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement de reproduction créé avec succès'
      });

      await fetchRecords();
      return data;
    } catch (error: any) {
      console.error('Error creating reproduction record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'enregistrement de reproduction',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: Partial<ReproductionRecord>) => {
    try {
      const { error } = await supabase
        .from('reproduction_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement de reproduction mis à jour'
      });

      await fetchRecords();
    } catch (error: any) {
      console.error('Error updating reproduction record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'enregistrement',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reproduction_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement de reproduction supprimé'
      });

      await fetchRecords();
    } catch (error: any) {
      console.error('Error deleting reproduction record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'enregistrement',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchRecords();
    }
  }, [isReady, isAuthenticated, unitId, fetchRecords]);

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
};
