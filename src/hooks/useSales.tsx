import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

export interface SaleItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  clientName: string;
  clientContact: string;
  unitId: string;
  products: SaleItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'paid';
  paymentMethod: string;
  notes: string;
}

export const useSales = () => {
  const { isDemoMode, user, isAuthenticated } = useAuth();
  const { activeUnit, addTransaction } = useProductionUnits();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = useCallback(async () => {
    if (isDemoMode) {
      setSales([]);
      return;
    }
    if (!user?.id || !isAuthenticated) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSales((data || []).map((s: any) => ({
        id: s.id,
        date: s.date,
        clientName: s.client_name,
        clientContact: s.client_contact || '',
        unitId: s.unit_id,
        products: (s.sale_items || []).map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total
        })),
        totalAmount: s.total_amount,
        status: s.status as Sale['status'],
        paymentMethod: s.payment_method || '',
        notes: s.notes || ''
      })));
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, user?.id, isAuthenticated]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filteredSales = useMemo(() => {
    if (!activeUnit?.id) return sales;
    return sales.filter(s => s.unitId === activeUnit.id);
  }, [sales, activeUnit?.id]);

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    if (isDemoMode) {
      const newSale: Sale = { ...sale, id: `V${Date.now()}` };
      setSales(prev => [newSale, ...prev]);
      return newSale;
    }
    if (!user?.id) return null;

    try {
      // Insert the sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          unit_id: sale.unitId,
          date: sale.date,
          client_name: sale.clientName,
          client_contact: sale.clientContact,
          total_amount: sale.totalAmount,
          status: sale.status,
          payment_method: sale.paymentMethod,
          notes: sale.notes
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      if (sale.products.length > 0) {
        const itemsToInsert = sale.products.map(item => ({
          user_id: user.id,
          sale_id: saleData.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      const newSale: Sale = {
        id: saleData.id,
        date: saleData.date,
        clientName: saleData.client_name,
        clientContact: saleData.client_contact || '',
        unitId: saleData.unit_id,
        products: sale.products,
        totalAmount: saleData.total_amount,
        status: saleData.status as Sale['status'],
        paymentMethod: saleData.payment_method || '',
        notes: saleData.notes || ''
      };

      setSales(prev => [newSale, ...prev]);

      // Create revenue transaction in accounting
      if (sale.status === 'confirmed' || sale.status === 'paid') {
        await addTransaction({
          date: sale.date,
          type: 'revenue',
          category: 'Vente de poissons',
          description: `Vente à ${sale.clientName}`,
          amount: sale.totalAmount,
          currency: 'XOF',
          paymentMethod: sale.paymentMethod,
          client: sale.clientName,
          status: sale.status === 'paid' ? 'confirmed' : 'pending',
          unitId: sale.unitId,
          unitName: activeUnit?.name
        });
      }

      return newSale;
    } catch (err) {
      console.error('Error adding sale:', err);
      return null;
    }
  };

  return {
    sales: filteredSales,
    allSales: sales,
    loading,
    addSale,
    refetch: fetchSales
  };
};
