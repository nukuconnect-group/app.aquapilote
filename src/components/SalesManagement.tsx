
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Plus, TrendingUp, Users, FileText, Download, Calendar, DollarSign, Eye } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import ClientManager from './economics/ClientManager';
import InvoiceManager from './economics/InvoiceManager';
import DocumentTemplateManager from './economics/DocumentTemplateManager';
import ReceiptPreview, { ReceiptData } from './economics/ReceiptPreview';
import { useSales, Sale, SaleItem } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notificationService';
import { supabase } from '@/integrations/supabase/client';

const SalesManagement = () => {
  const { addLog } = useLogs();
  const { units, activeUnit } = useProductionUnits();
  const { formatCurrency, t, currency } = useSettings();
  const { toast } = useToast();
  const { sales, loading, addSale, updateSale } = useSales();
  
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [previewReceiptData, setPreviewReceiptData] = useState<ReceiptData | null>(null);

  const [newSale, setNewSale] = useState({
    clientName: '',
    clientContact: '',
    unitId: activeUnit?.id || '',
    products: [{ name: '', quantity: 0, unitPrice: 0 }],
    paymentMethod: 'Espèces',
    notes: ''
  });

  // Synchroniser la vente avec l'unité active
  useEffect(() => {
    if (!activeUnit?.id) return;
    setNewSale((prev) => ({ ...prev, unitId: activeUnit.id }));
  }, [activeUnit?.id]);

  // Les données affichées sont déjà filtrées par unité dans le hook
  const filteredSales = sales;

  // Calcul des stats basées sur les ventes de l'unité active
  const salesData = React.useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = filteredSales.length;
    const totalClients = [...new Set(filteredSales.map((s) => s.clientName))].length;
    const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    
    // Calculer les produits les plus vendus à partir des vraies données
    const productsMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    filteredSales.forEach(sale => {
      sale.products.forEach(product => {
        const existing = productsMap.get(product.name);
        if (existing) {
          existing.quantity += product.quantity;
          existing.revenue += product.total;
        } else {
          productsMap.set(product.name, {
            name: product.name,
            quantity: product.quantity,
            revenue: product.total
          });
        }
      });
    });
    
    const topProducts = Array.from(productsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculer les ventes par unité à partir des vraies données
    const salesByUnit = units.map(unit => {
      const unitSales = sales.filter(s => s.unitId === unit.id);
      const unitRevenue = unitSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      return {
        id: unit.id,
        name: unit.name,
        type: unit.type,
        revenue: unitRevenue,
        salesCount: unitSales.length
      };
    }).filter(u => u.salesCount > 0);

    return {
      totalRevenue,
      totalOrders,
      totalClients,
      avgOrderValue,
      monthlyGrowth: 0,
      topProducts,
      salesByUnit
    };
  }, [filteredSales, units, sales]);

  const handlePreviewReceipt = () => {
    const totalAmount = newSale.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    const taxRate = 20;
    const tax = totalAmount * (taxRate / 100);
    const total = totalAmount + tax;

    const receiptData: ReceiptData = {
      type: 'receipt',
      number: `REC-${new Date().getFullYear()}-${String(filteredSales.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      clientName: newSale.clientName,
      clientContact: newSale.clientContact,
      items: newSale.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        total: p.quantity * p.unitPrice
      })),
      subtotal: totalAmount,
      tax: tax,
      taxRate: taxRate,
      total: total,
      paymentMethod: newSale.paymentMethod,
      notes: newSale.notes,
      companyName: 'Aqua Pilote',
      companyAddress: 'Votre adresse',
      companyContact: 'contact@aquapilote.com'
    };

    setPreviewReceiptData(receiptData);
    setShowReceiptPreview(true);
  };

  const handleConfirmSale = async () => {
    const totalAmount = newSale.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    
    const result = await addSale({
      date: new Date().toISOString().split('T')[0],
      clientName: newSale.clientName,
      clientContact: newSale.clientContact,
      unitId: newSale.unitId,
      products: newSale.products.map(p => ({
        ...p,
        total: p.quantity * p.unitPrice
      })),
      totalAmount,
      status: 'confirmed',
      paymentMethod: newSale.paymentMethod,
      notes: newSale.notes
    });

    if (result) {
      addLog('Nouvelle vente', 'Vente', `Vente confirmée pour ${newSale.clientName} - ${formatCurrency(totalAmount)}`, 'info');
      toast({ title: "Vente enregistrée", description: `Vente de ${formatCurrency(totalAmount)} confirmée` });
      
      // Create notification for the sale
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createNotification({
          userId: user.id,
          title: 'Nouvelle vente',
          message: `Vente confirmée pour ${newSale.clientName} - ${formatCurrency(totalAmount)}`,
          type: 'success',
          module: 'Ventes',
          isCritical: false,
          metadata: {
            clientName: newSale.clientName,
            totalAmount,
            paymentMethod: newSale.paymentMethod
          }
        });
      }
    }
    
    setNewSale({
      clientName: '',
      clientContact: '',
      unitId: activeUnit?.id || '',
      products: [{ name: '', quantity: 0, unitPrice: 0 }],
      paymentMethod: 'Espèces',
      notes: ''
    });
    setShowSaleDialog(false);
    setShowReceiptPreview(false);
  };

  const addProduct = () => {
    setNewSale(prev => ({
      ...prev,
      products: [...prev.products, { name: '', quantity: 0, unitPrice: 0 }]
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setNewSale(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    await updateSale(saleId, { status: newStatus as 'pending' | 'confirmed' | 'delivered' | 'paid' });
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      addLog('Statut vente modifié', 'Vente', `${sale.clientName} - Statut: ${getStatusText(newStatus)}`, 'info');
      toast({ title: "Statut modifié", description: `Vente passée à "${getStatusText(newStatus)}"` });
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'XOF': return 'F CFA';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return currency;
    }
  };

  const generateSalesReport = () => {
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const reportData = {
      period: currentMonth,
      revenue: salesData.totalRevenue,
      orders: salesData.totalOrders,
      clients: salesData.totalClients,
      products: salesData.topProducts,
      units: salesData.salesByUnit
    };

    const currencySymbol = currency === 'XOF' ? 'CFA' : currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    
    const csvContent = [
      ['Rapport de Ventes - ' + reportData.period],
      [''],
      ['Résumé Global'],
      ['Chiffre d\'affaires total', reportData.revenue + ' ' + currencySymbol],
      ['Nombre de commandes', reportData.orders],
      ['Nombre de clients', reportData.clients],
      [''],
      ['Produits les plus vendus'],
      ['Produit', 'Quantité', 'Chiffre d\'affaires'],
      ...reportData.products.map(p => [p.name, p.quantity, p.revenue + ' ' + currencySymbol]),
      [''],
      ['Ventes par unité'],
      ['Unité', 'Type', 'Chiffre d\'affaires'],
      ...reportData.units.map(u => [u.name, u.type, u.revenue + ' ' + currencySymbol])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_ventes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addLog('Export rapport', 'Vente', 'Rapport de ventes exporté en CSV', 'info');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 truncate">Gestion des Ventes</h2>
              <p className="text-sm sm:text-base text-green-100">Suivi des ventes, clients et facturation par unité</p>
            </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nouvelle Vente</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Créer une Nouvelle Vente</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label>Nom du client</Label>
                      <Input 
                        value={newSale.clientName}
                        onChange={(e) => setNewSale(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Nom du client"
                      />
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <Input 
                        value={newSale.clientContact}
                        onChange={(e) => setNewSale(prev => ({ ...prev, clientContact: e.target.value }))}
                        placeholder="Téléphone ou email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Unité de production</Label>
                    <Select value={newSale.unitId} onValueChange={(value) => setNewSale(prev => ({ ...prev, unitId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} - {unit.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm sm:text-base">Produits</Label>
                      <Button size="sm" variant="outline" onClick={addProduct} className="text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {newSale.products.map((product, index) => (
                        <div key={index} className="flex flex-col gap-2 p-2 sm:p-3 border rounded">
                          <Input 
                            placeholder="Produit"
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            className="text-sm sm:text-base"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              type="number"
                              placeholder="Quantité"
                              value={product.quantity || ''}
                              onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="text-sm sm:text-base"
                            />
                            <Input 
                              type="number"
                              step="0.01"
                              placeholder="Prix unitaire"
                              value={product.unitPrice || ''}
                              onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="text-sm sm:text-base"
                            />
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm sm:text-base font-medium">
                              Total: {formatCurrency(product.quantity * product.unitPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right mt-2 sm:mt-3 p-2 bg-muted rounded">
                      <span className="text-base sm:text-lg font-bold">
                        Total: {formatCurrency(newSale.products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0))}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-sm sm:text-base">Mode de paiement</Label>
                      <Select value={newSale.paymentMethod} onValueChange={(value) => setNewSale(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Espèces" className="text-sm sm:text-base">Espèces</SelectItem>
                          <SelectItem value="Virement" className="text-sm sm:text-base">Virement</SelectItem>
                          <SelectItem value="Carte" className="text-sm sm:text-base">Carte bancaire</SelectItem>
                          <SelectItem value="Chèque" className="text-sm sm:text-base">Chèque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base">Notes</Label>
                      <Input 
                        value={newSale.notes}
                        onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes additionnelles"
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviewReceipt} 
                      className="flex-1"
                      disabled={!newSale.clientName || newSale.products.some(p => !p.name || p.quantity === 0)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser le reçu
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto text-sm sm:text-base" onClick={generateSalesReport}>
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Rapport</span>
            </Button>
          </div>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(salesData.totalRevenue)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Chiffre d'affaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base sm:text-2xl font-bold truncate">{salesData.totalOrders}</p>
                <p className="text-xs sm:text-sm text-gray-600">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base sm:text-2xl font-bold truncate">{salesData.totalClients}</p>
                <p className="text-xs sm:text-sm text-gray-600">Clients actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(salesData.avgOrderValue)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Panier moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes fonctionnalités */}
      <Tabs defaultValue="history" className="space-y-3 sm:space-y-4">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-full sm:w-auto min-w-full bg-muted">
            <TabsTrigger value="history" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Vue</span>
              <span className="sm:hidden">Vue</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Clients</span>
              <span className="sm:hidden">Cli.</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Factures</span>
              <span className="sm:hidden">Fact.</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Modèles</span>
              <span className="sm:hidden">Mod.</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm flex-1 sm:flex-none px-3 sm:px-4 whitespace-nowrap">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Produits</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                Historique Détaillé des Ventes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {filteredSales.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune vente enregistrée</p>
                  <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Nouvelle Vente" pour enregistrer votre première vente</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredSales.map(sale => (
                    <div key={sale.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{sale.clientName}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(sale.date).toLocaleDateString('fr-FR')} - {sale.clientContact}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-col sm:items-end">
                          <Select
                            value={sale.status}
                            onValueChange={(value) => handleStatusChange(sale.id, value)}
                          >
                            <SelectTrigger className="w-28 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="confirmed">Confirmée</SelectItem>
                              <SelectItem value="delivered">Livrée</SelectItem>
                              <SelectItem value="paid">Payée</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-base sm:text-lg font-bold text-green-600">
                            {formatCurrency(sale.totalAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted rounded p-2 sm:p-3 mb-3">
                        <p className="text-xs sm:text-sm font-medium mb-2">Produits vendus:</p>
                        {sale.products.map((product, idx) => (
                          <div key={idx} className="flex justify-between text-xs sm:text-sm gap-2">
                            <span className="truncate">{product.name} x {product.quantity}</span>
                            <span className="flex-shrink-0 font-medium">{formatCurrency(product.total)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Unité:</span>
                          <Badge variant="outline" className="text-xs">
                            {units.find(u => u.id === sale.unitId)?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Paiement:</span>
                          <span className="font-medium">{sale.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Statut:</span>
                          <Badge className={getStatusColor(sale.status)}>
                            {getStatusText(sale.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {sale.notes && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs sm:text-sm">
                          <strong>Notes:</strong> {sale.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Produits les plus vendus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {salesData.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.quantity} unités vendues</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucune vente enregistrée</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Ventes par unité
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.salesByUnit.length > 0 ? (
                  <div className="space-y-3">
                    {salesData.salesByUnit.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{unit.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {unit.type} • {unit.salesCount} ventes
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {formatCurrency(unit.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucune vente par unité</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <ClientManager />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="templates">
          <DocumentTemplateManager />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Catalogue de Produits Vendus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.topProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesData.topProducts.map((product, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Vendus: {product.quantity} unités</p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {product.quantity > 0 ? formatCurrency(product.revenue / product.quantity) : '0'} {getCurrencySymbol()}/unité
                          </Badge>
                          <span className="font-bold text-green-600">{formatCurrency(product.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun produit vendu</p>
                  <p className="text-sm text-muted-foreground mt-2">Enregistrez des ventes pour voir les produits ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Preview Dialog */}
      {previewReceiptData && (
        <ReceiptPreview
          open={showReceiptPreview}
          onOpenChange={setShowReceiptPreview}
          data={previewReceiptData}
          onConfirm={handleConfirmSale}
          showConfirmButton={true}
        />
      )}
    </div>
  );
};

export default SalesManagement;
