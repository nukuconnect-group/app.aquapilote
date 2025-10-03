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
import { 
  Package, 
  ShieldCheck, 
  ClipboardCheck, 
  AlertCircle,
  Plus,
  Star,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useLogs } from '@/contexts/LogsContext';

interface HACCPControl {
  id: string;
  date: string;
  unitId: string;
  controlPoint: string;
  temperature: string;
  hygiene: string;
  conformity: 'conforme' | 'non-conforme' | 'observation';
  notes: string;
  operator: string;
}

interface QualityRecord {
  id: string;
  date: string;
  unitId: string;
  productType: string;
  batchNumber: string;
  weight: number;
  appearance: number; // Note sur 5
  texture: number;
  smell: number;
  overallQuality: number;
  notes: string;
}

const TransformationManagement = () => {
  const { units, activeUnit } = useProductionUnits();
  const { addLog } = useLogs();
  
  const [showHACCPDialog, setShowHACCPDialog] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);

  const [haccpControls, setHaccpControls] = useState<HACCPControl[]>([
    {
      id: '1',
      date: '2024-03-15',
      unitId: 'TRANS001',
      controlPoint: 'Réception matière première',
      temperature: '4°C',
      hygiene: 'Excellent',
      conformity: 'conforme',
      notes: 'Tous les critères respectés',
      operator: 'Marie Dubois'
    },
    {
      id: '2',
      date: '2024-03-14',
      unitId: 'TRANS001',
      controlPoint: 'Zone de découpe',
      temperature: '6°C',
      hygiene: 'Bon',
      conformity: 'observation',
      notes: 'Légère déviation température, surveillance accrue',
      operator: 'Jean Martin'
    }
  ]);

  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>([
    {
      id: '1',
      date: '2024-03-15',
      unitId: 'TRANS001',
      productType: 'Filet de tilapia',
      batchNumber: 'LOT-2024-03-15',
      weight: 25.5,
      appearance: 5,
      texture: 4,
      smell: 5,
      overallQuality: 4.7,
      notes: 'Excellente qualité, produit premium'
    }
  ]);

  const [newHACCP, setNewHACCP] = useState({
    unitId: activeUnit?.id || '',
    controlPoint: '',
    temperature: '',
    hygiene: '',
    conformity: 'conforme' as HACCPControl['conformity'],
    notes: '',
    operator: ''
  });

  const [newQuality, setNewQuality] = useState({
    unitId: activeUnit?.id || '',
    productType: '',
    batchNumber: '',
    weight: '',
    appearance: '5',
    texture: '5',
    smell: '5',
    notes: ''
  });

  const handleSaveHACCP = () => {
    const control: HACCPControl = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...newHACCP
    };

    setHaccpControls(prev => [control, ...prev]);
    addLog('Contrôle HACCP', 'Transformation', `Contrôle enregistré: ${control.controlPoint}`, 'info');
    
    setNewHACCP({
      unitId: activeUnit?.id || '',
      controlPoint: '',
      temperature: '',
      hygiene: '',
      conformity: 'conforme',
      notes: '',
      operator: ''
    });
    setShowHACCPDialog(false);
  };

  const handleSaveQuality = () => {
    const appearance = parseInt(newQuality.appearance);
    const texture = parseInt(newQuality.texture);
    const smell = parseInt(newQuality.smell);
    const overallQuality = (appearance + texture + smell) / 3;

    const record: QualityRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      unitId: newQuality.unitId,
      productType: newQuality.productType,
      batchNumber: newQuality.batchNumber,
      weight: parseFloat(newQuality.weight),
      appearance,
      texture,
      smell,
      overallQuality: parseFloat(overallQuality.toFixed(1)),
      notes: newQuality.notes
    };

    setQualityRecords(prev => [record, ...prev]);
    addLog('Contrôle qualité', 'Transformation', `Produit contrôlé: ${record.productType}`, 'info');
    
    setNewQuality({
      unitId: activeUnit?.id || '',
      productType: '',
      batchNumber: '',
      weight: '',
      appearance: '5',
      texture: '5',
      smell: '5',
      notes: ''
    });
    setShowQualityDialog(false);
  };

  const getConformityColor = (conformity: HACCPControl['conformity']) => {
    switch (conformity) {
      case 'conforme':
        return 'bg-green-100 text-green-800';
      case 'non-conforme':
        return 'bg-red-100 text-red-800';
      case 'observation':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getConformityIcon = (conformity: HACCPControl['conformity']) => {
    switch (conformity) {
      case 'conforme':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'non-conforme':
        return <XCircle className="w-4 h-4" />;
      case 'observation':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const averageQuality = qualityRecords.length > 0
    ? (qualityRecords.reduce((sum, r) => sum + r.overallQuality, 0) / qualityRecords.length).toFixed(1)
    : '0';

  const conformityRate = haccpControls.length > 0
    ? ((haccpControls.filter(c => c.conformity === 'conforme').length / haccpControls.length) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6 p-2 sm:p-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestion de la Transformation</h2>
            <p className="text-purple-100">Normes HACCP et contrôle qualité des produits</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showHACCPDialog} onOpenChange={setShowHACCPDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Contrôle HACCP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau contrôle HACCP</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unité de production</Label>
                    <Select value={newHACCP.unitId} onValueChange={(value) => setNewHACCP(prev => ({ ...prev, unitId: value }))}>
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
                    <Label>Point de contrôle</Label>
                    <Select value={newHACCP.controlPoint} onValueChange={(value) => setNewHACCP(prev => ({ ...prev, controlPoint: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Réception matière première">Réception matière première</SelectItem>
                        <SelectItem value="Zone de découpe">Zone de découpe</SelectItem>
                        <SelectItem value="Zone de conditionnement">Zone de conditionnement</SelectItem>
                        <SelectItem value="Stockage réfrigéré">Stockage réfrigéré</SelectItem>
                        <SelectItem value="Expédition">Expédition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Température</Label>
                    <Input 
                      value={newHACCP.temperature}
                      onChange={(e) => setNewHACCP(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="ex: 4°C"
                    />
                  </div>
                  <div>
                    <Label>Niveau d'hygiène</Label>
                    <Select value={newHACCP.hygiene} onValueChange={(value) => setNewHACCP(prev => ({ ...prev, hygiene: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Bon">Bon</SelectItem>
                        <SelectItem value="Acceptable">Acceptable</SelectItem>
                        <SelectItem value="Insuffisant">Insuffisant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Conformité</Label>
                    <Select value={newHACCP.conformity} onValueChange={(value: HACCPControl['conformity']) => setNewHACCP(prev => ({ ...prev, conformity: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="non-conforme">Non conforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Opérateur</Label>
                    <Input 
                      value={newHACCP.operator}
                      onChange={(e) => setNewHACCP(prev => ({ ...prev, operator: e.target.value }))}
                      placeholder="Nom de l'opérateur"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Notes et observations</Label>
                    <Textarea 
                      value={newHACCP.notes}
                      onChange={(e) => setNewHACCP(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observations détaillées..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={handleSaveHACCP} className="w-full">
                      Enregistrer le contrôle
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Contrôle Qualité
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Contrôle qualité produit</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unité de production</Label>
                    <Select value={newQuality.unitId} onValueChange={(value) => setNewQuality(prev => ({ ...prev, unitId: value }))}>
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
                    <Label>Type de produit</Label>
                    <Input 
                      value={newQuality.productType}
                      onChange={(e) => setNewQuality(prev => ({ ...prev, productType: e.target.value }))}
                      placeholder="ex: Filet de tilapia"
                    />
                  </div>
                  <div>
                    <Label>Numéro de lot</Label>
                    <Input 
                      value={newQuality.batchNumber}
                      onChange={(e) => setNewQuality(prev => ({ ...prev, batchNumber: e.target.value }))}
                      placeholder="LOT-XXXX-XX-XX"
                    />
                  </div>
                  <div>
                    <Label>Poids (kg)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newQuality.weight}
                      onChange={(e) => setNewQuality(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label>Apparence (1-5)</Label>
                    <Select value={newQuality.appearance} onValueChange={(value) => setNewQuality(prev => ({ ...prev, appearance: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Très bon' : n === 3 ? 'Bon' : n === 2 ? 'Moyen' : 'Médiocre'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Texture (1-5)</Label>
                    <Select value={newQuality.texture} onValueChange={(value) => setNewQuality(prev => ({ ...prev, texture: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Très bon' : n === 3 ? 'Bon' : n === 2 ? 'Moyen' : 'Médiocre'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Odeur (1-5)</Label>
                    <Select value={newQuality.smell} onValueChange={(value) => setNewQuality(prev => ({ ...prev, smell: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Très bon' : n === 3 ? 'Bon' : n === 2 ? 'Moyen' : 'Médiocre'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={newQuality.notes}
                      onChange={(e) => setNewQuality(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observations sur la qualité..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={handleSaveQuality} className="w-full">
                      Enregistrer le contrôle qualité
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Taux de conformité HACCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{conformityRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {haccpControls.filter(c => c.conformity === 'conforme').length} contrôles conformes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              Qualité moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${getQualityColor(parseFloat(averageQuality))}`}>
              {averageQuality}/5
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {qualityRecords.length} produits contrôlés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Production totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {qualityRecords.reduce((sum, r) => sum + r.weight, 0).toFixed(1)} kg
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="haccp" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="haccp">Contrôles HACCP</TabsTrigger>
          <TabsTrigger value="quality">Qualité Produits</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="haccp" className="space-y-4">
          <div className="space-y-4">
            {haccpControls.map(control => (
              <Card key={control.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{control.controlPoint}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(control.date).toLocaleDateString('fr-FR')} • {units.find(u => u.id === control.unitId)?.name}
                      </p>
                    </div>
                    <Badge className={getConformityColor(control.conformity)}>
                      {getConformityIcon(control.conformity)}
                      <span className="ml-1">
                        {control.conformity === 'conforme' ? 'Conforme' : control.conformity === 'non-conforme' ? 'Non conforme' : 'Observation'}
                      </span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Température:</span>
                      <p className="font-medium">{control.temperature}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hygiène:</span>
                      <p className="font-medium">{control.hygiene}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opérateur:</span>
                      <p className="font-medium">{control.operator}</p>
                    </div>
                  </div>
                  {control.notes && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {control.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="space-y-4">
            {qualityRecords.map(record => (
              <Card key={record.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{record.productType}</h4>
                      <p className="text-sm text-muted-foreground">
                        Lot: {record.batchNumber} • {new Date(record.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getQualityColor(record.overallQuality)}`}>
                        {record.overallQuality}/5
                      </p>
                      <p className="text-xs text-muted-foreground">Qualité globale</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-bold">{record.appearance}/5</p>
                      <p className="text-xs text-muted-foreground">Apparence</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-bold">{record.texture}/5</p>
                      <p className="text-xs text-muted-foreground">Texture</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-bold">{record.smell}/5</p>
                      <p className="text-xs text-muted-foreground">Odeur</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-bold">{record.weight} kg</p>
                      <p className="text-xs text-muted-foreground">Poids</p>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Rapports de conformité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Rapport HACCP mensuel</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Analyse des contrôles HACCP du mois en cours
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le rapport
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Rapport qualité produits</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Synthèse des contrôles qualité et statistiques
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le rapport
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Certificat de conformité</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Document officiel de conformité aux normes
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le certificat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransformationManagement;