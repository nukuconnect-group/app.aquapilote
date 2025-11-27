
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Clock, Bell, Printer, Mail, Trash2 } from 'lucide-react';
import { useFeedingPlans } from '@/hooks/useFeedingPlans';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { generateFeedingPlanHTML, printHTML } from '@/lib/feedingPrintUtils';

interface FeedingPlanSchedulerProps {
  unitId: string;
  unitName: string;
  cycleId?: string;
  cycleName: string;
}

const FeedingPlanScheduler = ({ unitId, unitName, cycleId, cycleName }: FeedingPlanSchedulerProps) => {
  const { plans, loading, createPlan, updatePlan, deletePlan } = useFeedingPlans(unitId, cycleId);
  const { infrastructures, loading: loadingInfra } = useCycleInfrastructures(cycleId || '');

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    time: '',
    feedType: '',
    quantity: '',
    unit: 'kg',
    days: [] as string[],
    infrastructureId: '',
    notes: ''
  });

  const weekDays = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' }
  ];

  const feedTypes = [
    'Aliment starter (0.5-1mm)',
    'Aliment croissance (2-3mm)',
    'Aliment finition (4-6mm)',
    'Aliment reproducteurs',
    'Aliment médiqué',
    'Complément vitaminé'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPlan({
        unit_id: unitId,
        cycle_id: cycleId,
        infrastructure_id: formData.infrastructureId || undefined,
        time: formData.time,
        feed_type: formData.feedType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        days: formData.days,
        is_active: true,
        notes: formData.notes
      });

      setIsOpen(false);
      setFormData({
        time: '',
        feedType: '',
        quantity: '',
        unit: 'kg',
        days: [],
        infrastructureId: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const togglePlanStatus = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      await updatePlan(planId, { is_active: !plan.is_active });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      await deletePlan(planId);
    }
  };

  const handlePrint = () => {
    const html = generateFeedingPlanHTML(plans, unitName);
    printHTML(html);
  };

  const toggleDay = (day: string) => {
    const updatedDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days: updatedDays });
  };

  const getNextFeedingTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][now.getDay()];
    
    const activePlans = plans.filter(p => p.is_active && p.days.includes(currentDay));
    const upcomingPlans = activePlans.filter(p => {
      const [hours, minutes] = p.time.split(':').map(Number);
      const planTime = hours * 60 + minutes;
      return planTime > currentTime;
    });

    if (upcomingPlans.length > 0) {
      upcomingPlans.sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      });
      return upcomingPlans[0];
    }

    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Chargement des planifications...
        </CardContent>
      </Card>
    );
  }

  const nextFeeding = getNextFeedingTime();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Planification des nourrissages</h3>
          <p className="text-sm text-gray-600">Unité: {unitName}</p>
        </div>
        <div className="flex gap-2">
          {plans.length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Imprimer
              </Button>
            </>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nouveau planning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau planning de nourrissage</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <Label htmlFor="feedType">Type d'aliment</Label>
                <Select value={formData.feedType} onValueChange={(value) => setFormData({...formData, feedType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {cycleId && infrastructures.length > 0 && (
                <div>
                  <Label htmlFor="infrastructure">Infrastructure</Label>
                  <Select 
                    value={formData.infrastructureId} 
                    onValueChange={(value) => setFormData({...formData, infrastructureId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une infrastructure (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {infrastructures.map((infra) => (
                        <SelectItem key={infra.id} value={infra.id}>
                          {infra.infrastructure_name} ({infra.infrastructure_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Jours de la semaine</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {weekDays.map((day) => (
                    <div key={day.key} className="flex items-center space-x-2">
                      <Switch
                        id={day.key}
                        checked={formData.days.includes(day.key)}
                        onCheckedChange={() => toggleDay(day.key)}
                      />
                      <Label htmlFor={day.key} className="text-sm">{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notes sur ce planning..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Créer planning
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {nextFeeding && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <h4 className="font-medium text-orange-800">Prochain nourrissage</h4>
            </div>
            <div className="text-sm">
              <p className="font-medium">{nextFeeding.time} - {nextFeeding.feed_type}</p>
              <p className="text-orange-700">{nextFeeding.quantity} {nextFeeding.unit}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {plans.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucun planning configuré. Créez votre premier planning de nourrissage.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">{plan.time}</h4>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{plan.feed_type}</p>
                  <p className="text-sm font-medium mb-2">{plan.quantity} {plan.unit}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {plan.days.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </Badge>
                    ))}
                  </div>
                  {plan.notes && (
                    <p className="text-xs text-gray-500">{plan.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={() => togglePlanStatus(plan.id)}
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedingPlanScheduler;
