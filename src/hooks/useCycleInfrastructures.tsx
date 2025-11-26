import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CycleInfrastructure {
  id: string;
  cycle_id: string;
  infrastructure_name: string;
  infrastructure_type: string;
  current_quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useCycleInfrastructures = (cycleId?: string) => {
  const [infrastructures, setInfrastructures] = useState<CycleInfrastructure[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInfrastructures = async () => {
    if (!cycleId) {
      setInfrastructures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cycle_infrastructures')
        .select('*')
        .eq('cycle_id', cycleId as any)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setInfrastructures(data as unknown as CycleInfrastructure[]);
      }
    } catch (error: any) {
      // Gérer l'erreur SecurityError de LockManager sans afficher de toast
      if (error?.message?.includes('LockManager') || error?.code === '18') {
        console.warn('LockManager not available, skipping...');
        setInfrastructures([]);
      } else {
        console.error('Error fetching infrastructures:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les infrastructures',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfrastructures();
  }, [cycleId]);

  const createInfrastructures = async (cycleId: string, infrastructureNames: string[], infrastructureType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const infrastructuresToCreate = infrastructureNames.map(name => ({
        cycle_id: cycleId,
        infrastructure_name: name,
        infrastructure_type: infrastructureType,
        current_quantity: 0,
      }));

      const { data, error } = await supabase
        .from('cycle_infrastructures')
        .insert(infrastructuresToCreate as any)
        .select();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `${infrastructureNames.length} infrastructure(s) rattachée(s) au cycle`,
      });

      await fetchInfrastructures();
      return data;
    } catch (error: any) {
      console.error('Error creating infrastructures:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rattacher les infrastructures',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateInfrastructure = async (id: string, updates: Partial<CycleInfrastructure>) => {
    try {
      const { error } = await supabase
        .from('cycle_infrastructures')
        .update(updates)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Infrastructure mise à jour',
      });

      await fetchInfrastructures();
    } catch (error: any) {
      console.error('Error updating infrastructure:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'infrastructure',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteInfrastructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cycle_infrastructures')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Infrastructure retirée du cycle',
      });

      await fetchInfrastructures();
    } catch (error: any) {
      console.error('Error deleting infrastructure:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer l\'infrastructure',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    infrastructures,
    loading,
    createInfrastructures,
    updateInfrastructure,
    deleteInfrastructure,
    refetch: fetchInfrastructures,
  };
};
