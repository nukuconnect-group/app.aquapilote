import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Plus, CheckCircle2, ClipboardList, Trash2, Bell, Volume2, Edit } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { usePlannedTasks, PlannedTask } from '@/hooks/usePlannedTasks';
import { useFeedingPlans } from '@/hooks/useFeedingPlans';
import { notificationHelpers } from '@/lib/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const TaskScheduler = () => {
  const { addLog } = useLogs();
  const { units, activeUnit } = useProductionUnits();
  const { t } = useSettings();
  const { user } = useAuth();
  const { tasks, loading, error, refetch, createTask, updateTask, deleteTask, upcomingTasks, playAlertSound } = usePlannedTasks(activeUnit?.id);
  const { plans: feedingPlans } = useFeedingPlans(activeUnit?.id || '');

  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannedTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    type: 'feeding' as PlannedTask['type'],
    description: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    priority: 'medium' as PlannedTask['priority'],
    unitId: activeUnit?.id || '',
    unitName: activeUnit?.name || ''
  });

  // Synchronize with active unit
  useEffect(() => {
    if (activeUnit?.id) {
      setTaskForm(prev => ({ ...prev, unitId: activeUnit.id, unitName: activeUnit.name }));
    }
  }, [activeUnit?.id, activeUnit?.name]);

  // Filter tasks by active unit
  const filteredTasks = useMemo(() => {
    if (!activeUnit?.id) return tasks;
    return tasks.filter(task => task.unit_id === activeUnit.id || !task.unit_id);
  }, [tasks, activeUnit?.id]);

  // Combine feeding plans as tasks
  const feedingPlanTasks = useMemo(() => {
    if (!feedingPlans || feedingPlans.length === 0) return [];
    
    const today = new Date();
    const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][today.getDay()];
    
    return feedingPlans
      .filter(plan => plan.is_active && plan.days.includes(dayName))
      .map(plan => ({
        id: `feeding-${plan.id}`,
        title: `Nourrissage: ${plan.feed_type}`,
        type: 'feeding' as const,
        description: `Quantité: ${plan.quantity} ${plan.unit}${plan.notes ? ` - ${plan.notes}` : ''}`,
        due_date: today.toISOString().split('T')[0],
        due_time: plan.time,
        priority: 'medium' as const,
        status: 'pending' as const,
        unit_id: plan.unit_id,
        unit_name: activeUnit?.name || '',
        source: 'feeding_plan' as const,
        source_id: plan.id,
        assigned_to: null,
        alert_sent: false,
        user_id: '',
        created_at: plan.created_at || '',
        updated_at: plan.updated_at || '',
      }));
  }, [feedingPlans, activeUnit?.name]);

  // Combine all tasks
  const allTasks = useMemo(() => {
    const combined = [...filteredTasks, ...feedingPlanTasks];
    return combined.sort((a, b) => {
      if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
      return a.due_time.localeCompare(b.due_time);
    });
  }, [filteredTasks, feedingPlanTasks]);

  const resetForm = () => {
    setTaskForm({
      title: '',
      type: 'feeding',
      description: '',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '09:00',
      priority: 'medium',
      unitId: activeUnit?.id || '',
      unitName: activeUnit?.name || ''
    });
    setEditingTask(null);
    setShowAddTask(false);
  };

  const handleEditTask = (task: PlannedTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      type: task.type,
      description: task.description || '',
      assignedTo: task.assigned_to || '',
      dueDate: task.due_date,
      dueTime: task.due_time,
      priority: task.priority,
      unitId: task.unit_id || activeUnit?.id || '',
      unitName: task.unit_name || activeUnit?.name || ''
    });
    setShowAddTask(true);
  };

  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    
    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, {
          title: taskForm.title,
          type: taskForm.type,
          description: taskForm.description || null,
          assigned_to: taskForm.assignedTo || null,
          due_date: taskForm.dueDate,
          due_time: taskForm.dueTime,
          priority: taskForm.priority,
          unit_id: taskForm.unitId || null,
          unit_name: taskForm.unitName || null,
        });
        
        addLog('Tâche modifiée', 'Planification', `${taskForm.title} mise à jour`, 'info');
      } else {
        // Create new task
        await createTask({
          title: taskForm.title,
          type: taskForm.type,
          description: taskForm.description || null,
          assigned_to: taskForm.assignedTo || null,
          due_date: taskForm.dueDate,
          due_time: taskForm.dueTime,
          priority: taskForm.priority,
          status: 'pending',
          unit_id: taskForm.unitId || null,
          unit_name: taskForm.unitName || null,
          source: 'manual',
          source_id: null,
        });
        
        addLog('Tâche ajoutée', 'Planification', `${taskForm.title} programmée pour ${taskForm.dueDate} à ${taskForm.dueTime}`, 'info');
        
        // Send notification
        if (user?.id) {
          notificationHelpers.taskCreated(user.id, taskForm.title, taskForm.dueDate);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string, taskTitle: string) => {
    await updateTask(taskId, { status: 'completed' });
    if (user?.id) {
      notificationHelpers.taskCompleted(user.id, taskTitle);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: PlannedTask['status']) => {
    // Skip feeding plan pseudo-tasks
    if (taskId.startsWith('feeding-')) return;
    await updateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (taskId.startsWith('feeding-')) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await deleteTask(taskId);
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Chargement des tâches...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <div className="text-sm text-destructive">
            Erreur de chargement des tâches : {error}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Planification des Tâches
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={playAlertSound} title="Tester le son d'alerte">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Tâche
          </Button>
        </div>
      </div>

      {/* Upcoming tasks alert */}
      {upcomingTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-orange-800">
                {upcomingTasks.length} tâche(s) à venir dans les 24h
              </h4>
            </div>
            <div className="space-y-1">
              {upcomingTasks.slice(0, 3).map(task => (
                <div key={task.id} className="text-sm text-orange-700">
                  • {task.due_time} - {task.title}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddTask} onOpenChange={(open) => { if (!open) resetForm(); else setShowAddTask(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Modifier la tâche' : 'Ajouter une nouvelle tâche'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="taskTitle">Titre de la tâche *</Label>
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
                  onValueChange={(value) => setTaskForm({...taskForm, type: value as PlannedTask['type']})}
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
                  onValueChange={(value) => setTaskForm({...taskForm, priority: value as PlannedTask['priority']})}
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
                <Label htmlFor="taskDate">Date d'échéance *</Label>
                <Input
                  id="taskDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="taskTime">Heure *</Label>
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
                <Select 
                  value={taskForm.unitId} 
                  onValueChange={(value) => {
                    const unit = units.find(u => u.id === value);
                    setTaskForm({...taskForm, unitId: value, unitName: unit?.name || ''});
                  }}
                >
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

            <div className="flex gap-2">
              <Button onClick={addTask}>{editingTask ? 'Enregistrer' : 'Ajouter'}</Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {allTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-4" />
            <p>Aucune tâche planifiée{activeUnit ? ` pour ${activeUnit.name}` : ''}</p>
            <p className="text-sm mt-2">Créez votre première tâche ou activez des planifications d'alimentation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allTasks.map((task) => (
            <Card key={task.id} className={task.source === 'feeding_plan' ? 'border-green-200 bg-green-50/30' : ''}>
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
                      {task.source === 'feeding_plan' && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Plan automatique
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.due_date} à {task.due_time}
                      </div>
                      {task.assigned_to && (
                        <span>Assigné à: <strong>{task.assigned_to}</strong></span>
                      )}
                      {task.unit_name && (
                        <span>Unité: <strong>{task.unit_name}</strong></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    
                    {task.source !== 'feeding_plan' && (
                      <div className="flex gap-1">
                        {task.status !== 'completed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                            >
                              En cours
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteTask(task.id, task.title)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
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
