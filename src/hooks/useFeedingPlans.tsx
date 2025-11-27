import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { useToast } from '@/hooks/use-toast';

export interface FeedingPlan {
  id: string;
  user_id: string;
  unit_id: string;
  cycle_id?: string;
  time: string;
  feed_type: string;
  quantity: number;
  unit: string;
  days: string[];
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFeedingPlans = (unitId?: string, cycleId?: string) => {
  const [plans, setPlans] = useState<FeedingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('feeding_plans')
        .select('*')
        .order('time', { ascending: true });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }
      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setPlans(data as FeedingPlan[]);
      }
    } catch (error: any) {
      console.error('Error fetching feeding plans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les planifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [unitId, cycleId]);

  const createPlan = async (plan: Omit<FeedingPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('feeding_plans')
        .insert([{ ...plan, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Planning créé avec succès',
      });

      await fetchPlans();
      return data as FeedingPlan;
    } catch (error: any) {
      console.error('Error creating feeding plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le planning',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<FeedingPlan>) => {
    try {
      const { error } = await supabase
        .from('feeding_plans')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Planning mis à jour',
      });

      await fetchPlans();
    } catch (error: any) {
      console.error('Error updating feeding plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le planning',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feeding_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Planning supprimé',
      });

      await fetchPlans();
    } catch (error: any) {
      console.error('Error deleting feeding plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le planning',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans,
  };
};
