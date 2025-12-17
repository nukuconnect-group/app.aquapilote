import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuthReady } from '@/hooks/useAuthReady';

export interface LivestockBatch {
  id: string;
  user_id: string;
  species: string;
  variety: string | null;
  type: string | null;
  quantity: number;
  average_weight: number;
  total_weight: number;
  acquisition_date: string | null;
  source: string | null;
  unit_id: string;
  unit_name: string;
  status: string;
  notes: string | null;
  expected_harvest_date: string | null;
  current_age: number;
  feeding_plan: string | null;
  last_health_check: string | null;
  expected_survival_rate: number;
  created_at: string;
  updated_at: string;
}

export const useLivestockBatches = (unitId?: string) => {
  const [batches, setBatches] = useState<LivestockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isReady, isAuthenticated, getUserId } = useAuthReady();

  const fetchBatches = useCallback(async () => {
    // Attendre que l'auth soit prête
    if (!isReady) return;
    
    // Ne pas charger si non authentifié
    if (!isAuthenticated) {
      setBatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('livestock_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        throw fetchError;
      }
      
      setBatches(data || []);
    } catch (err: any) {
      console.error('Error fetching livestock batches:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les lots de poissons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isReady, isAuthenticated, unitId, toast]);

  const createBatch = async (batch: Omit<LivestockBatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('livestock_batches')
        .insert([{ ...batch, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Lot de poissons créé avec succès'
      });

      await fetchBatches();
      return data;
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le lot de poissons',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateBatch = async (id: string, updates: Partial<LivestockBatch>) => {
    try {
      const { error } = await supabase
        .from('livestock_batches')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Lot de poissons mis à jour'
      });

      await fetchBatches();
    } catch (error: any) {
      console.error('Error updating batch:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le lot',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('livestock_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Lot de poissons supprimé'
      });

      await fetchBatches();
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le lot',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Charger les données quand l'auth est prête
  useEffect(() => {
    if (isReady) {
      fetchBatches();
    }
  }, [isReady, isAuthenticated, unitId, fetchBatches]);

  return {
    batches,
    loading,
    error,
    createBatch,
    updateBatch,
    deleteBatch,
    refetch: fetchBatches
  };
};
