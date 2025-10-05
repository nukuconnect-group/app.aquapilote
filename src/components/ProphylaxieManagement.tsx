import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { 
  Heart, 
  AlertTriangle, 
  Plus,
  Calendar as CalendarIcon,
  Syringe,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Wifi
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useLogs } from '@/contexts/LogsContext';
import CameraAnalysis from './prophylaxie/CameraAnalysis';
import IoTModeAnalysis from './prophylaxie/IoTModeAnalysis';
import ReportGenerator from './prophylaxie/ReportGenerator';
import DiseaseManager from './prophylaxie/DiseaseManager';

interface Treatment {
  id: string;
  date: string;
  unitId: string;
  type: 'vaccination' | 'treatment' | 'disinfection';
  product: string;
  dosage: string;
  lot: string;
  operator: string;
  notes: string;
  status: 'planned' | 'completed' | 'cancelled';
}

interface HealthAlert {
  id: string;
  date: string;
  unitId: string;
  severity: 'low' | 'medium' | 'high';
  type: string;
  description: string;
  status: 'active' | 'resolved';
}

const ProphylaxieManagement = () => {
  const { units, activeUnit } = useProductionUnits();
  const { addLog } = useLogs();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showIoTDialog, setShowIoTDialog] = useState(false);

  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: '1',
      date: '2024-03-20',
      unitId: 'GROSS001',
      type: 'vaccination',
      product: 'Vaccin Anti-Aeromonas',
      dosage: '0.5 ml/kg',
      lot: 'VAC2024-03',
      operator: 'Dr. Martin',
      notes: 'Vaccination annuelle, tous les bassins',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-03-25',
      unitId: 'TRANS001',
      type: 'disinfection',
      product: 'Chlore actif',
      dosage: '5 ppm',
      lot: 'DIS2024-01',
      operator: 'Jean Dupont',
      notes: 'Désinfection mensuelle',
      status: 'planned'
    }
  ]);

  const [alerts, setAlerts] = useState<HealthAlert[]>([
    {
      id: '1',
      date: '2024-03-15',
      unitId: 'GROSS001',
      severity: 'high',
      type: 'Mortalité anormale',
      description: 'Taux de mortalité supérieur à 2% dans le bassin B3',
      status: 'active'
    },
    {
      id: '2',
      date: '2024-03-14',
      unitId: 'TRANS001',
      severity: 'medium',
      type: 'Température anormale',
      description: 'Température en dessous de 20°C',
      status: 'resolved'
    }
  ]);

  const [newTreatment, setNewTreatment] = useState({
    unitId: activeUnit?.id || '',
    type: 'vaccination' as Treatment['type'],
    product: '',
    dosage: '',
    lot: '',
    operator: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSaveTreatment = () => {
    const treatment: Treatment = {
      id: Date.now().toString(),
      ...newTreatment,
      status: 'planned'
    };

    setTreatments(prev => [treatment, ...prev]);
    addLog('Traitement ajouté', 'Prophylaxie', `${treatment.type} planifié pour ${treatment.unitId}`, 'info');
    
    setNewTreatment({
      unitId: activeUnit?.id || '',
      type: 'vaccination',
      product: '',
      dosage: '',
      lot: '',
      operator: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowTreatmentDialog(false);
  };

  const toggleTreatmentStatus = (id: string) => {
    setTreatments(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'completed' ? 'planned' : 'completed' as Treatment['status'] }
        : t
    ));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'resolved' as const } : a
    ));
    addLog('Alerte résolue', 'Prophylaxie', 'Une alerte sanitaire a été marquée comme résolue', 'success');
  };

  const filteredTreatments = selectedUnitFilter === 'all' 
    ? treatments 
    : treatments.filter(t => t.unitId === selectedUnitFilter);

  const filteredAlerts = selectedUnitFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.unitId === selectedUnitFilter);

  const getTypeIcon = (type: Treatment['type']) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="w-4 h-4" />;
      case 'treatment':
        return <Heart className="w-4 h-4" />;
      case 'disinfection':
        return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Treatment['type']) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'treatment':
        return 'bg-red-100 text-red-800';
      case 'disinfection':
        return 'bg-green-100 text-green-800';
    }
  };

  const getSeverityColor = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const upcomingTreatments = treatments
    .filter(t => t.status === 'planned' && new Date(t.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 p-2 sm:p-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestion de la Prophylaxie</h2>
            <p className="text-red-100">Calendrier sanitaire et suivi des traitements avec IA</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CameraAnalysis />
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => setShowIoTDialog(true)}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Analyser avec IoT
            </Button>
            <Dialog open={showTreatmentDialog} onOpenChange={setShowTreatmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau traitement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Planifier un traitement</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unité de production</Label>
                  <Select value={newTreatment.unitId} onValueChange={(value) => setNewTreatment(prev => ({ ...prev, unitId: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de traitement</Label>
                  <Select value={newTreatment.type} onValueChange={(value: Treatment['type']) => setNewTreatment(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="treatment">Traitement</SelectItem>
                      <SelectItem value="disinfection">Désinfection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date prévue</Label>
                  <Input 
                    type="date"
                    value={newTreatment.date}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Produit</Label>
                  <Input 
                    value={newTreatment.product}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, product: e.target.value }))}
                    placeholder="Nom du produit"
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input 
                    value={newTreatment.dosage}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="ex: 0.5 ml/kg"
                  />
                </div>
                <div>
                  <Label>Numéro de lot</Label>
                  <Input 
                    value={newTreatment.lot}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, lot: e.target.value }))}
                    placeholder="LOT-XXXX"
                  />
                </div>
                <div>
                  <Label>Opérateur</Label>
                  <Input 
                    value={newTreatment.operator}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, operator: e.target.value }))}
                    placeholder="Nom de l'opérateur"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={newTreatment.notes}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Instructions et observations..."
                  />
                </div>
                <div className="col-span-2">
                  <Button onClick={handleSaveTreatment} className="w-full">
                    Enregistrer le traitement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Filtre */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2 font-medium">
              <Filter className="w-4 h-4" />
              Filtrer par unité :
            </Label>
            <Select value={selectedUnitFilter} onValueChange={setSelectedUnitFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les unités</SelectItem>
                {units.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="treatments">Traitements</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes
            {alerts.filter(a => a.status === 'active').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {alerts.filter(a => a.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="diseases">Maladies</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Calendrier sanitaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Traitements à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTreatments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun traitement planifié
                    </p>
                  ) : (
                    upcomingTreatments.map(treatment => (
                      <div key={treatment.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(treatment.type)}
                            <span className="font-medium text-sm">{treatment.product}</span>
                          </div>
                          <Badge className={getTypeColor(treatment.type)}>
                            {treatment.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(treatment.date).toLocaleDateString('fr-FR')} • {units.find(u => u.id === treatment.unitId)?.name}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <div className="space-y-4">
            {filteredTreatments.map(treatment => (
              <Card key={treatment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(treatment.type).replace('text-', 'bg-').replace('800', '100')}`}>
                        {getTypeIcon(treatment.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{treatment.product}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(treatment.date).toLocaleDateString('fr-FR')} • {units.find(u => u.id === treatment.unitId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(treatment.type)}>
                        {treatment.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant={treatment.status === 'completed' ? 'default' : 'outline'}
                        onClick={() => toggleTreatmentStatus(treatment.id)}
                      >
                        {treatment.status === 'completed' ? (
                          <><CheckCircle2 className="w-4 h-4 mr-1" /> Effectué</>
                        ) : (
                          <><Clock className="w-4 h-4 mr-1" /> Planifié</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>
                      <p className="font-medium">{treatment.dosage}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lot:</span>
                      <p className="font-medium">{treatment.lot}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opérateur:</span>
                      <p className="font-medium">{treatment.operator}</p>
                    </div>
                  </div>
                  {treatment.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {treatment.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className={`border-l-4 ${alert.severity === 'high' ? 'border-l-red-500' : alert.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.type}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity === 'high' ? 'Élevé' : alert.severity === 'medium' ? 'Moyen' : 'Faible'}
                          </Badge>
                          {alert.status === 'resolved' && (
                            <Badge className="bg-green-100 text-green-800">Résolu</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.date).toLocaleDateString('fr-FR')} • {units.find(u => u.id === alert.unitId)?.name}
                        </p>
                      </div>
                    </div>
                    {alert.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Résoudre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planning de prophylaxie par unité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {units.map(unit => {
                  const unitTreatments = treatments.filter(t => t.unitId === unit.id && t.status === 'planned');
                  return (
                    <div key={unit.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{unit.name}</h4>
                      {unitTreatments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun traitement planifié</p>
                      ) : (
                        <div className="space-y-2">
                          {unitTreatments.map(treatment => (
                            <div key={treatment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(treatment.type)}
                                <span className="text-sm">{treatment.product}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(treatment.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="diseases">
          <DiseaseManager />
        </TabsContent>
      </Tabs>

      {/* Génération de rapports */}
      <ReportGenerator />

      {/* Dialog IoT Analysis */}
      <IoTModeAnalysis showDialog={showIoTDialog} onClose={() => setShowIoTDialog(false)} />
    </div>
  );
};

export default ProphylaxieManagement;