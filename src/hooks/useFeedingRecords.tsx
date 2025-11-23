import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeedingRecord {
  id: string;
  user_id: string;
  cycle_id?: string;
  unit_id: string;
  date: string;
  time?: string;
  feed_type?: string;
  quantity: number;
  fcr?: number;
  temperature?: number;
  behavior?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFeedingRecords = (cycleId?: string, unitId?: string) => {
  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('feeding_records')
        .select('*')
        .order('date', { ascending: false });

      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching feeding records:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les enregistrements d\'alimentation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [cycleId, unitId]);

  const createRecord = async (record: Omit<FeedingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('feeding_records')
        .insert([{ ...record, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Enregistrement d\'alimentation créé',
      });

      await fetchRecords();
      return data;
    } catch (error: any) {
      console.error('Error creating feeding record:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'enregistrement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: Partial<FeedingRecord>) => {
    try {
      const { error } = await supabase
        .from('feeding_records')
        .update(updates)
        .eq('id', id);

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
        .from('feeding_records')
        .delete()
        .eq('id', id);

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
