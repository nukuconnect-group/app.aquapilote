import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { useToast } from '@/hooks/use-toast';

export interface FeedStock {
  id: string;
  user_id: string;
  unit_id: string;
  custom_name?: string;
  feed_type: string;
  quantity: number;
  unit: string;
  expiration_date?: string;
  supplier?: string;
  cost?: number;
  protein_content?: number;
  fat_content?: number;
  notes?: string;
  min_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

export const useFeedStocks = (unitId?: string) => {
  const [stocks, setStocks] = useState<FeedStock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('feed_stocks')
        .select('*')
        .order('created_at', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setStocks(data as FeedStock[]);
      }
    } catch (error: any) {
      console.error('Error fetching feed stocks:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les stocks d\'aliments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [unitId]);

  const createStock = async (stock: Omit<FeedStock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('feed_stocks')
        .insert([{ ...stock, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Stock d\'aliment créé avec succès',
      });

      await fetchStocks();
      return data as FeedStock;
    } catch (error: any) {
      console.error('Error creating feed stock:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le stock d\'aliment',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateStock = async (id: string, updates: Partial<FeedStock>) => {
    try {
      const { error } = await supabase
        .from('feed_stocks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Stock d\'aliment mis à jour',
      });

      await fetchStocks();
    } catch (error: any) {
      console.error('Error updating feed stock:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le stock',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feed_stocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Stock d\'aliment supprimé',
      });

      await fetchStocks();
    } catch (error: any) {
      console.error('Error deleting feed stock:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le stock',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    stocks,
    loading,
    createStock,
    updateStock,
    deleteStock,
    refetch: fetchStocks,
  };
};
