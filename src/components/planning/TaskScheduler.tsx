import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, CheckCircle2, ClipboardList } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';

interface Task {
  id: string;
  title: string;
  type: 'feeding' | 'purchase' | 'sale' | 'monitoring' | 'maintenance' | 'health';
  description: string;
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  unitId?: string;
}

const TaskScheduler = () => {
  const { addLog } = useLogs();
  const { units, activeUnit } = useProductionUnits();
  const { t } = useSettings();
  
  // Initialisation avec un tableau vide - pas de données de démo
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    type: 'feeding' as Task['type'],
    description: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    priority: 'medium' as Task['priority'],
    unitId: activeUnit?.id || ''
  });

  // Synchroniser avec l'unité active
  useEffect(() => {
    if (activeUnit?.id) {
      setTaskForm(prev => ({ ...prev, unitId: activeUnit.id }));
    }
  }, [activeUnit?.id]);

  // Filtrer les tâches par unité active
  const filteredTasks = useMemo(() => {
    if (!activeUnit?.id) return tasks;
    return tasks.filter(task => task.unitId === activeUnit.id);
  }, [tasks, activeUnit?.id]);

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      ...taskForm,
      status: 'pending'
    };
    setTasks([...tasks, task]);
    addLog('Tâche ajoutée', 'Planification', `${taskForm.title} programmée pour ${taskForm.dueDate}`, 'info');
    setTaskForm({
      title: '',
      type: 'feeding',
      description: '',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '09:00',
      priority: 'medium',
      unitId: ''
    });
    setShowAddTask(false);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feeding': return 'Nourrissage';
      case 'purchase': return 'Achat';
      case 'sale': return 'Vente';
      case 'monitoring': return 'Surveillance';
      case 'maintenance': return 'Maintenance';
      case 'health': return 'Santé';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-purple-100 text-purple-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'health': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Planification des Tâches
        </h3>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Tâche
        </Button>
      </div>

      {showAddTask && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une nouvelle tâche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="taskTitle">Titre de la tâche</Label>
                <Input
                  id="taskTitle"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Ex: Nourrissage des carpes"
                />
              </div>
              
              <div>
                <Label htmlFor="taskType">Type de tâche</Label>
                <Select 
                  value={taskForm.type} 
                  onValueChange={(value) => setTaskForm({...taskForm, type: value as Task['type']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Nourrissage</SelectItem>
                    <SelectItem value="purchase">Achat</SelectItem>
                    <SelectItem value="sale">Vente</SelectItem>
                    <SelectItem value="monitoring">Surveillance</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="health">Santé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taskPriority">Priorité</Label>
                <Select 
                  value={taskForm.priority} 
                  onValueChange={(value) => setTaskForm({...taskForm, priority: value as Task['priority']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taskDate">Date d'échéance</Label>
                <Input
                  id="taskDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="taskTime">Heure</Label>
                <Input
                  id="taskTime"
                  type="time"
                  value={taskForm.dueTime}
                  onChange={(e) => setTaskForm({...taskForm, dueTime: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="taskAssigned">Assigné à</Label>
                <Input
                  id="taskAssigned"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                  placeholder="Nom de la personne"
                />
              </div>

              <div>
                <Label htmlFor="taskUnit">Unité de production</Label>
                <Select value={taskForm.unitId} onValueChange={(value) => setTaskForm({...taskForm, unitId: value})}>
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

              <div className="md:col-span-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Détails de la tâche..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={addTask}>Ajouter</Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-4" />
            <p>Aucune tâche planifiée{activeUnit ? ` pour ${activeUnit.name}` : ''}</p>
            <p className="text-sm mt-2">Créez votre première tâche en cliquant sur "Nouvelle Tâche"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge className={getTypeColor(task.type)}>
                        {getTypeLabel(task.type)}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate} à {task.dueTime}
                      </div>
                      {task.assignedTo && (
                        <span>Assigné à: <strong>{task.assignedTo}</strong></span>
                      )}
                      {task.unitId && (
                        <span>Unité: <strong>{units.find(u => u.id === task.unitId)?.name}</strong></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    
                    {task.status !== 'completed' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        >
                          En cours
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskScheduler;
