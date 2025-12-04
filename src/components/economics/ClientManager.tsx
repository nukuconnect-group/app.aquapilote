
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Edit, Phone, Mail, MapPin, ShoppingCart, AlertCircle } from 'lucide-react';
import { clientSchema, ClientInput } from '@/lib/validationSchemas';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'potential' | 'active' | 'inactive';
  totalOrders: number;
  totalRevenue: number;
  lastOrder: string;
}

interface Order {
  id: string;
  clientId: string;
  clientName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

const ClientManager = () => {
  const { toast } = useToast();
  const { formatCurrency, t } = useSettings();
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Restaurant Les Saveurs',
      email: 'contact@lessaveurs.fr',
      phone: '01 23 45 67 89',
      address: '123 Rue de la Paix, Paris',
      status: 'active',
      totalOrders: 15,
      totalRevenue: 12500,
      lastOrder: '2024-01-15'
    },
    {
      id: '2',
      name: 'Aquarium Municipal',
      email: 'direction@aquarium-ville.fr',
      phone: '01 98 76 54 32',
      address: '456 Avenue des Poissons, Lyon',
      status: 'potential',
      totalOrders: 0,
      totalRevenue: 0,
      lastOrder: ''
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'Restaurant Les Saveurs',
      productType: 'Carpes matures',
      quantity: 50,
      unitPrice: 15,
      totalAmount: 750,
      status: 'processing',
      orderDate: '2024-01-10',
      deliveryDate: '2024-01-20'
    },
    {
      id: '2',
      clientId: '1',
      clientName: 'Restaurant Les Saveurs',
      productType: 'Alevins',
      quantity: 200,
      unitPrice: 2.5,
      totalAmount: 500,
      status: 'pending',
      orderDate: '2024-01-15'
    }
  ]);

  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'potential' as 'potential' | 'active' | 'inactive'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAddClient = () => {
    setValidationErrors({});
    
    try {
      // Validation des données avec Zod
      const validatedData: ClientInput = clientSchema.parse(newClient);
      
      const client: Client = {
        id: Date.now().toString(),
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        status: validatedData.status,
        totalOrders: 0,
        totalRevenue: 0,
        lastOrder: ''
      };
      
      setClients([...clients, client]);
      setNewClient({ name: '', email: '', phone: '', address: '', status: 'potential' });
      setShowAddClient(false);
      
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès.",
      });
    } catch (error: any) {
      if (error.errors) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
        
        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'potential': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('active');
      case 'potential': return t('potential') || 'Potentiel';
      case 'inactive': return t('inactive');
      case 'pending': return t('pending');
      case 'processing': return t('processing') || 'En cours';
      case 'delivered': return t('delivered') || 'Livré';
      case 'cancelled': return t('cancelled') || 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {t('clientManagement') || 'Gestion des Clients'}
        </h3>
        <Button onClick={() => setShowAddClient(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('newClient') || 'Nouveau Client'}
        </Button>
      </div>

      {showAddClient && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouveau client</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Veuillez corriger les erreurs dans le formulaire avant de soumettre.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Nom du client"
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="clientStatus">Statut</Label>
                <Select 
                  value={newClient.status} 
                  onValueChange={(value) => setNewClient({...newClient, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="potential">Potentiel</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="email@example.com"
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="01 23 45 67 89"
                  className={validationErrors.phone ? 'border-destructive' : ''}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Adresse complète"
                  className={validationErrors.address ? 'border-destructive' : ''}
                />
                {validationErrors.address && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddClient}>Ajouter</Button>
              <Button variant="outline" onClick={() => setShowAddClient(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <div className="grid gap-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <Badge className={getStatusColor(client.status)}>
                          {getStatusLabel(client.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.address}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>{t('orders') || 'Commandes'}: <strong>{client.totalOrders}</strong></span>
                        <span>{t('totalRevenue') || 'CA total'}: <strong>{formatCurrency(client.totalRevenue)}</strong></span>
                        {client.lastOrder && (
                          <span>{t('lastOrder') || 'Dernière commande'}: <strong>{client.lastOrder}</strong></span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Commandes en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date commande</TableHead>
                    <TableHead>Livraison</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.clientName}</TableCell>
                      <TableCell>{order.productType}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.deliveryDate || 'À définir'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManager;
