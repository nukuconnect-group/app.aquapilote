
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Save, AlertTriangle, Calculator } from 'lucide-react';

interface FeedingRecord {
  id: string;
  date: string;
  time: string;
  feedType: string;
  quantity: number;
  unit: string;
  temperature: number;
  notes: string;
  unitId: string;
  feederName: string;
  prescribedQuantity: number;
  actualQuantity: number;
  remainingQuantity: number;
  fishBehavior: string;
}

interface FeedingFormProps {
  unitId: string;
  unitName: string;
  onSave: (record: Omit<FeedingRecord, 'id'>) => void;
}

const FeedingForm = ({ unitId, unitName, onSave }: FeedingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    feedType: '',
    feederName: '',
    prescribedQuantity: '',
    actualQuantity: '',
    unit: 'kg',
    temperature: '',
    notes: '',
    fishBehavior: ''
  });

  const feedTypes = [
    'Aliment starter (0.5-1mm)',
    'Aliment croissance (2-3mm)',
    'Aliment finition (4-6mm)',
    'Aliment reproducteurs',
    'Aliment médiqué',
    'Complément vitaminé'
  ];

  const fishBehaviors = [
    'Comportement normal',
    'Très actifs',
    'Peu actifs',
    'Refus partiel de nourriture',
    'Refus total de nourriture',
    'Comportement agressif',
    'Stress visible'
  ];

  const calculateRemainingQuantity = () => {
    const prescribed = parseFloat(formData.prescribedQuantity) || 0;
    const actual = parseFloat(formData.actualQuantity) || 0;
    return Math.max(0, prescribed - actual);
  };

  const remainingQuantity = calculateRemainingQuantity();
  const hasRemainingFood = remainingQuantity > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const record = {
      date: formData.date,
      time: formData.time,
      feedType: formData.feedType,
      feederName: formData.feederName,
      prescribedQuantity: parseFloat(formData.prescribedQuantity),
      actualQuantity: parseFloat(formData.actualQuantity),
      remainingQuantity,
      unit: formData.unit,
      temperature: parseFloat(formData.temperature),
      notes: formData.notes,
      fishBehavior: formData.fishBehavior,
      unitId,
      quantity: parseFloat(formData.actualQuantity) // Pour compatibilité
    };

    onSave(record);
    setIsOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      feedType: '',
      feederName: '',
      prescribedQuantity: '',
      actualQuantity: '',
      unit: 'kg',
      temperature: '',
      notes: '',
      fishBehavior: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle fiche alimentation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fiche d'alimentation - {unitName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="feederName">Nom de la personne</Label>
            <Input
              id="feederName"
              value={formData.feederName}
              onChange={(e) => setFormData({...formData, feederName: e.target.value})}
              placeholder="Nom de la personne qui nourrit"
              required
            />
          </div>

          <div>
            <Label htmlFor="feedType">Type d'aliment</Label>
            <Select onValueChange={(value) => setFormData({...formData, feedType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type d'aliment" />
              </SelectTrigger>
              <SelectContent>
                {feedTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prescribedQuantity">Quantité prescrite</Label>
              <Input
                id="prescribedQuantity"
                type="number"
                step="0.1"
                value={formData.prescribedQuantity}
                onChange={(e) => setFormData({...formData, prescribedQuantity: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="actualQuantity">Quantité servie</Label>
              <Input
                id="actualQuantity"
                type="number"
                step="0.1"
                value={formData.actualQuantity}
                onChange={(e) => setFormData({...formData, actualQuantity: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calcul automatique de la quantité restante */}
          {(formData.prescribedQuantity && formData.actualQuantity) && (
            <Card className={`p-3 ${hasRemainingFood ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Quantité restante: {remainingQuantity.toFixed(1)} {formData.unit}
                </span>
              </div>
            </Card>
          )}

          {/* Alerte si de la nourriture reste */}
          {hasRemainingFood && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Il reste de la nourriture non consommée. Veuillez décrire l'état des poissons.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="fishBehavior">Comportement des poissons</Label>
            <Select 
              value={formData.fishBehavior} 
              onValueChange={(value) => setFormData({...formData, fishBehavior: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le comportement observé" />
              </SelectTrigger>
              <SelectContent>
                {fishBehaviors.map((behavior) => (
                  <SelectItem key={behavior} value={behavior}>{behavior}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="temperature">Température de l'eau (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({...formData, temperature: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes et observations</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Conditions particulières, observations spéciales..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedingForm;
