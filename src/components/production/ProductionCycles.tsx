
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ProductionCycle {
  id: number;
  bassin: string;
  espece: string;
  dateDebut: string;
  datePrevue: string;
  progression: number;
  statut: string;
  nbPoissons: number;
  poidsTotal: string;
  tailleMoyenne: string;
}

const ProductionCycles = () => {
  const [cyclesProduction, setCyclesProduction] = useState<ProductionCycle[]>([
    {
      id: 1,
      bassin: "Bassin A1",
      espece: "Carpe commune",
      dateDebut: "2024-01-15",
      datePrevue: "2024-07-15",
      progression: 65,
      statut: "En cours",
      nbPoissons: 1200,
      poidsTotal: "2.4T",
      tailleMoyenne: "25cm"
    },
    {
      id: 2,
      bassin: "Bassin B2",
      espece: "Tilapia",
      dateDebut: "2024-02-01",
      datePrevue: "2024-08-01",
      progression: 45,
      statut: "En cours",
      nbPoissons: 800,
      poidsTotal: "1.6T",
      tailleMoyenne: "18cm"
    },
    {
      id: 3,
      bassin: "Bassin C1",
      espece: "Truite arc-en-ciel",
      dateDebut: "2024-03-10",
      datePrevue: "2024-09-10",
      progression: 25,
      statut: "Démarrage",
      nbPoissons: 600,
      poidsTotal: "0.8T",
      tailleMoyenne: "12cm"
    }
  ]);

  const [newCycle, setNewCycle] = useState({
    bassin: '',
    espece: '',
    dateDebut: '',
    duree: '6',
    nbPoissons: '',
    poidsInitial: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const bassinsDisponibles = [
    'Bassin A1', 'Bassin A2', 'Bassin B1', 'Bassin B2', 'Bassin C1', 'Bassin C2',
    'Étang Nord', 'Étang Sud', 'Cage Flottante 1', 'Cage Flottante 2'
  ];

  const especesDisponibles = [
    'Carpe commune', 'Tilapia', 'Truite arc-en-ciel', 'Saumon', 'Bar', 'Dorade',
    'Brochet', 'Perche', 'Sandre', 'Silure'
  ];

  const addCycle = () => {
    const dateDebut = new Date(newCycle.dateDebut);
    const datePrevue = new Date(dateDebut);
    datePrevue.setMonth(datePrevue.getMonth() + parseInt(newCycle.duree));

    const cycle: ProductionCycle = {
      id: cyclesProduction.length + 1,
      bassin: newCycle.bassin,
      espece: newCycle.espece,
      dateDebut: newCycle.dateDebut,
      datePrevue: datePrevue.toISOString().split('T')[0],
      progression: 0,
      statut: "Planifié",
      nbPoissons: parseInt(newCycle.nbPoissons),
      poidsTotal: newCycle.poidsInitial + 'kg',
      tailleMoyenne: "5cm"
    };

    setCyclesProduction([...cyclesProduction, cycle]);
    setNewCycle({
      bassin: '',
      espece: '',
      dateDebut: '',
      duree: '6',
      nbPoissons: '',
      poidsInitial: ''
    });
    setIsDialogOpen(false);
  };

  const deleteCycle = (id: number) => {
    setCyclesProduction(cyclesProduction.filter(cycle => cycle.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cycles de Production</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-aqua hover:bg-gradient-aqua/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau cycle de production</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bassin">Infrastructure</Label>
                <Select onValueChange={(value) => setNewCycle({...newCycle, bassin: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une infrastructure" />
                  </SelectTrigger>
                  <SelectContent>
                    {bassinsDisponibles.map((bassin) => (
                      <SelectItem key={bassin} value={bassin}>{bassin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="espece">Espèce</Label>
                <Select onValueChange={(value) => setNewCycle({...newCycle, espece: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une espèce" />
                  </SelectTrigger>
                  <SelectContent>
                    {especesDisponibles.map((espece) => (
                      <SelectItem key={espece} value={espece}>{espece}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateDebut">Date de début</Label>
                  <Input
                    id="dateDebut"
                    type="date"
                    value={newCycle.dateDebut}
                    onChange={(e) => setNewCycle({...newCycle, dateDebut: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duree">Durée (mois)</Label>
                  <Select value={newCycle.duree} onValueChange={(value) => setNewCycle({...newCycle, duree: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 mois</SelectItem>
                      <SelectItem value="6">6 mois</SelectItem>
                      <SelectItem value="9">9 mois</SelectItem>
                      <SelectItem value="12">12 mois</SelectItem>
                      <SelectItem value="18">18 mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nbPoissons">Nombre de poissons</Label>
                  <Input
                    id="nbPoissons"
                    type="number"
                    placeholder="1000"
                    value={newCycle.nbPoissons}
                    onChange={(e) => setNewCycle({...newCycle, nbPoissons: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="poidsInitial">Poids initial (kg)</Label>
                  <Input
                    id="poidsInitial"
                    type="number"
                    placeholder="500"
                    value={newCycle.poidsInitial}
                    onChange={(e) => setNewCycle({...newCycle, poidsInitial: e.target.value})}
                  />
                </div>
              </div>
              
              <Button onClick={addCycle} className="w-full bg-gradient-aqua">
                Créer le cycle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {cyclesProduction.map((cycle) => (
        <Card key={cycle.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{cycle.bassin}</h3>
                <p className="text-sm text-gray-600">{cycle.espece}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  cycle.statut === 'En cours' ? 'default' :
                  cycle.statut === 'Démarrage' ? 'secondary' : 
                  cycle.statut === 'Planifié' ? 'outline' : 'outline'
                }>
                  {cycle.statut}
                </Badge>
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => deleteCycle(cycle.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Nombre de poissons</p>
                <p className="font-semibold">{cycle.nbPoissons.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Poids total</p>
                <p className="font-semibold">{cycle.poidsTotal}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Taille moyenne</p>
                <p className="font-semibold">{cycle.tailleMoyenne}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Progression</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-aqua-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${cycle.progression}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{cycle.progression}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span>Début: </span>
                <span className="font-medium">
                  {new Date(cycle.dateDebut).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span>Récolte prévue: </span>
                <span className="font-medium">
                  {new Date(cycle.datePrevue).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductionCycles;
