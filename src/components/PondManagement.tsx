
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Droplets, Plus, Edit, Trash2, Thermometer, Activity, Fish } from 'lucide-react';

const PondManagement = () => {
  const [ponds, setPonds] = useState([
    {
      id: 'B001',
      name: 'Bassin Principal A',
      volume: 15000,
      profondeur: 2.5,
      type: 'production',
      temperature: 26.8,
      ph: 7.2,
      oxygenLevel: 8.2,
      fishCount: 2450,
      species: 'Tilapia',
      status: 'optimal',
      dateCreation: '2024-01-15'
    },
    {
      id: 'B002',
      name: 'Bassin Élevage B',
      volume: 8000,
      profondeur: 1.8,
      type: 'elevage',
      temperature: 25.4,
      ph: 7.0,
      oxygenLevel: 7.8,
      fishCount: 1800,
      species: 'Carpe',
      status: 'good',
      dateCreation: '2024-02-20'
    }
  ]);

  const [newPond, setNewPond] = useState({
    name: '',
    volume: '',
    profondeur: '',
    type: 'production'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addPond = () => {
    const pond = {
      id: `B${String(ponds.length + 1).padStart(3, '0')}`,
      name: newPond.name,
      volume: parseInt(newPond.volume),
      profondeur: parseFloat(newPond.profondeur),
      type: newPond.type,
      temperature: 25.0,
      ph: 7.0,
      oxygenLevel: 8.0,
      fishCount: 0,
      species: '',
      status: 'optimal',
      dateCreation: new Date().toISOString().split('T')[0]
    };
    setPonds([...ponds, pond]);
    setNewPond({ name: '', volume: '', profondeur: '', type: 'production' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Bassins</h2>
          <p className="text-gray-600">Surveillance et gestion de vos installations aquacoles</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-aqua hover:bg-gradient-aqua/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Bassin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau bassin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du bassin</Label>
                <Input
                  id="name"
                  value={newPond.name}
                  onChange={(e) => setNewPond({...newPond, name: e.target.value})}
                  placeholder="Bassin Principal C"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="volume">Volume (L)</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={newPond.volume}
                    onChange={(e) => setNewPond({...newPond, volume: e.target.value})}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <Label htmlFor="profondeur">Profondeur (m)</Label>
                  <Input
                    id="profondeur"
                    type="number"
                    step="0.1"
                    value={newPond.profondeur}
                    onChange={(e) => setNewPond({...newPond, profondeur: e.target.value})}
                    placeholder="2.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Type de bassin</Label>
                <Select value={newPond.type} onValueChange={(value) => setNewPond({...newPond, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="elevage">Élevage</SelectItem>
                    <SelectItem value="reproduction">Reproduction</SelectItem>
                    <SelectItem value="quarantaine">Quarantaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addPond} className="w-full bg-gradient-aqua">
                Créer le bassin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {ponds.map((pond) => (
          <Card key={pond.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pond.name}</CardTitle>
                <Badge className={getStatusColor(pond.status)}>
                  {pond.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">#{pond.id} • {pond.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{pond.volume.toLocaleString()}L</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span>{pond.temperature}°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>pH: {pond.ph}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fish className="w-4 h-4 text-aqua-500" />
                  <span>{pond.fishCount} poissons</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">O₂: {pond.oxygenLevel} mg/L</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PondManagement;
