import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { getDemoData } from '@/lib/demoData';

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
  dueDate?: string;
  isCredit?: boolean;
  paidAmount?: number;
  paymentTerms?: string;
  documentType?: 'receipt' | 'invoice';
  documentNumber?: string;
  taxRate?: number;
}

export const useSales = () => {
  const { isDemoMode, user, isAuthenticated } = useAuth();
  const { activeUnit, addTransaction } = useProductionUnits();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = useCallback(async () => {
    if (isDemoMode) {
      const demoData = getDemoData();
      const demoSales = (demoData.sales || []).map((s: any) => ({
        id: s.id,
        date: s.date,
        clientName: s.client_name,
        clientContact: s.client_contact || '',
        unitId: s.unit_id,
        products: [],
        totalAmount: s.total_amount,
        status: s.status as Sale['status'],
        paymentMethod: s.payment_method || '',
        notes: s.notes || '',
        dueDate: s.due_date || undefined,
        isCredit: s.is_credit || false,
        paidAmount: s.paid_amount || 0,
        paymentTerms: s.payment_terms || undefined
      }));
      setSales(demoSales);
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
        notes: s.notes || '',
        dueDate: s.due_date || undefined,
        isCredit: s.is_credit || false,
        paidAmount: s.paid_amount || 0,
        paymentTerms: s.payment_terms || undefined,
        documentType: (s.document_type as 'receipt' | 'invoice') || 'receipt',
        documentNumber: s.document_number || undefined,
        taxRate: typeof s.tax_rate === 'number' ? s.tax_rate : Number(s.tax_rate) || 0
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
          notes: sale.notes,
          due_date: sale.dueDate || null,
          is_credit: sale.isCredit || false,
          paid_amount: sale.paidAmount || 0,
          payment_terms: sale.paymentTerms || null,
          document_type: sale.documentType || 'receipt',
          document_number: sale.documentNumber || null,
          tax_rate: sale.taxRate ?? 0
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
        notes: saleData.notes || '',
        dueDate: saleData.due_date || undefined,
        isCredit: saleData.is_credit || false,
        paidAmount: saleData.paid_amount || 0,
        paymentTerms: saleData.payment_terms || undefined,
        documentType: (saleData.document_type as 'receipt' | 'invoice') || 'receipt',
        documentNumber: saleData.document_number || undefined,
        taxRate: typeof saleData.tax_rate === 'number' ? saleData.tax_rate : Number(saleData.tax_rate) || 0
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

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return null;

    if (isDemoMode) {
      const updatedSale = { ...sale, ...updates };
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));

      // If status changed to confirmed or paid and wasn't before, create transaction
      const wasNotConfirmed = sale.status !== 'confirmed' && sale.status !== 'paid';
      const isNowConfirmed = updates.status === 'confirmed' || updates.status === 'paid';
      
      if (wasNotConfirmed && isNowConfirmed) {
        await addTransaction({
          date: updatedSale.date,
          type: 'revenue',
          category: 'Vente de poissons',
          description: `Vente à ${updatedSale.clientName}`,
          amount: updatedSale.totalAmount,
          currency: 'XOF',
          paymentMethod: updatedSale.paymentMethod,
          client: updatedSale.clientName,
          status: updates.status === 'paid' ? 'confirmed' : 'pending',
          unitId: updatedSale.unitId,
          unitName: activeUnit?.name
        });
      }

      return updatedSale;
    }

    if (!user?.id) return null;

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
      if (updates.clientContact !== undefined) dbUpdates.client_contact = updates.clientContact;
      if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.isCredit !== undefined) dbUpdates.is_credit = updates.isCredit;
      if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;
      if (updates.paymentTerms !== undefined) dbUpdates.payment_terms = updates.paymentTerms;

      const { error } = await supabase
        .from('sales')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedSale = { ...sale, ...updates };
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));

      // If status changed to confirmed or paid and wasn't before, create transaction
      const wasNotConfirmed = sale.status !== 'confirmed' && sale.status !== 'paid';
      const isNowConfirmed = updates.status === 'confirmed' || updates.status === 'paid';
      
      if (wasNotConfirmed && isNowConfirmed) {
        await addTransaction({
          date: updatedSale.date,
          type: 'revenue',
          category: 'Vente de poissons',
          description: `Vente à ${updatedSale.clientName}`,
          amount: updatedSale.totalAmount,
          currency: 'XOF',
          paymentMethod: updatedSale.paymentMethod,
          client: updatedSale.clientName,
          status: updates.status === 'paid' ? 'confirmed' : 'pending',
          unitId: updatedSale.unitId,
          unitName: activeUnit?.name
        });
      }

      return updatedSale;
    } catch (err) {
      console.error('Error updating sale:', err);
      return null;
    }
  };

  const deleteSale = async (id: string) => {
    if (isDemoMode) {
      setSales(prev => prev.filter(s => s.id !== id));
      return true;
    }
    if (!user?.id) return false;

    try {
      // Delete sale items first
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', id);

      if (itemsError) throw itemsError;

      // Delete the sale
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSales(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting sale:', err);
      return false;
    }
  };

  return {
    sales: filteredSales,
    allSales: sales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    refetch: fetchSales
  };
};
