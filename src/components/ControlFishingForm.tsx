import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Fish } from 'lucide-react';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ControlFishingFormProps {
  unitId: string;
}

const ControlFishingForm = ({ unitId }: ControlFishingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cycles } = useProductionCycles(unitId);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const { infrastructures } = useCycleInfrastructures(selectedCycleId);
  const { createRecord } = useHealthRecords();
  
  const [formData, setFormData] = useState({
    infrastructureId: '',
    date: new Date().toISOString().split('T')[0],
    temperature: '',
    ph: '',
    oxygen: '',
    mortality: '',
    average_weight: '',
    sample_count: '',
    notes: ''
  });

  const activeCycles = cycles.filter(c => c.status === 'active');
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createRecord({
        cycle_id: selectedCycleId,
        unit_id: unitId,
        basin_id: formData.infrastructureId, // basin_id = infrastructure_id
        date: formData.date,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        ph: formData.ph ? parseFloat(formData.ph) : undefined,
        oxygen: formData.oxygen ? parseFloat(formData.oxygen) : undefined,
        mortality: formData.mortality ? parseFloat(formData.mortality) : undefined,
        average_weight: formData.average_weight ? parseFloat(formData.average_weight) : undefined,
        sample_count: formData.sample_count ? parseInt(formData.sample_count) : undefined,
        notes: formData.notes
      });
      
      setIsOpen(false);
      
      // Reset form
      setFormData({
        infrastructureId: '',
        date: new Date().toISOString().split('T')[0],
        temperature: '',
        ph: '',
        oxygen: '',
        mortality: '',
        average_weight: '',
        sample_count: '',
        notes: ''
      });
      setSelectedCycleId('');
    } catch (error) {
      console.error('Error creating control fishing record:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Fish className="w-4 h-4 mr-2" />
          Pêche de contrôle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Enregistrer une pêche de contrôle
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du cycle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cycle de production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cycle">Cycle actif</Label>
                {activeCycles.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucun cycle actif disponible. Créez d'abord un cycle de production.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select 
                    value={selectedCycleId} 
                    onValueChange={setSelectedCycleId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name} - {cycle.species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedCycleId && (
                <div>
                  <Label htmlFor="infrastructure">Infrastructure</Label>
                  {infrastructures.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Aucune infrastructure rattachée à ce cycle.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select 
                      value={formData.infrastructureId} 
                      onValueChange={(value) => setFormData({...formData, infrastructureId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une infrastructure" />
                      </SelectTrigger>
                      <SelectContent>
                        {infrastructures.map((infra) => (
                          <SelectItem key={infra.id} value={infra.id}>
                            {infra.infrastructure_name} ({infra.infrastructure_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Données de la pêche */}
          {formData.infrastructureId && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Données de mesure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date de la pêche</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Température (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        placeholder="25.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ph">pH</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        value={formData.ph}
                        onChange={(e) => setFormData({...formData, ph: e.target.value})}
                        placeholder="7.2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="oxygen">Oxygène dissous (mg/L)</Label>
                      <Input
                        id="oxygen"
                        type="number"
                        step="0.1"
                        value={formData.oxygen}
                        onChange={(e) => setFormData({...formData, oxygen: e.target.value})}
                        placeholder="6.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mortality">Mortalité (nombre)</Label>
                      <Input
                        id="mortality"
                        type="number"
                        step="1"
                        value={formData.mortality}
                        onChange={(e) => setFormData({...formData, mortality: e.target.value})}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Données biométriques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sample_count">Nombre d'individus échantillonnés</Label>
                      <Input
                        id="sample_count"
                        type="number"
                        step="1"
                        value={formData.sample_count}
                        onChange={(e) => setFormData({...formData, sample_count: e.target.value})}
                        placeholder="30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="average_weight">Poids moyen (g)</Label>
                      <Input
                        id="average_weight"
                        type="number"
                        step="0.1"
                        value={formData.average_weight}
                        onChange={(e) => setFormData({...formData, average_weight: e.target.value})}
                        placeholder="250"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Observations</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Notes et observations sur la pêche de contrôle..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full">
                Enregistrer la pêche de contrôle
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ControlFishingForm;
