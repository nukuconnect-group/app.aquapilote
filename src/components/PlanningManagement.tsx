import React, { useMemo } from 'react';
import { Calendar, Clock, CheckSquare, ClipboardList, Bell, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskScheduler from './planning/TaskScheduler';
import ProductionUnitSelector from './ProductionUnitSelector';
import { usePlannedTasks } from '@/hooks/usePlannedTasks';
import { useFeedingPlans } from '@/hooks/useFeedingPlans';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const PlanningManagement = () => {
  const { activeUnit } = useProductionUnits();
  const { tasks, todayTasks, upcomingTasks } = usePlannedTasks(activeUnit?.id);
  const { plans: feedingPlans } = useFeedingPlans(activeUnit?.id || '');

  // Get feeding plan tasks for today
  const feedingPlanTasksToday = useMemo(() => {
    if (!feedingPlans || feedingPlans.length === 0) return [];
    
    const today = new Date();
    const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][today.getDay()];
    
    return feedingPlans
      .filter(plan => plan.is_active && plan.days.includes(dayName))
      .map(plan => ({
        id: `feeding-${plan.id}`,
        title: `Nourrissage: ${plan.feed_type}`,
        type: 'feeding',
        time: plan.time,
        quantity: `${plan.quantity} ${plan.unit}`,
        status: 'pending',
        source: 'feeding_plan',
      }));
  }, [feedingPlans]);

  // Combine all today tasks
  const allTodayTasks = useMemo(() => {
    const manualTasks = todayTasks.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      time: t.due_time,
      status: t.status,
      source: 'manual',
    }));
    
    const feedingTasks = feedingPlanTasksToday.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      time: t.time,
      status: t.status,
      source: t.source,
    }));
    
    return [...manualTasks, ...feedingTasks].sort((a, b) => a.time.localeCompare(b.time));
  }, [todayTasks, feedingPlanTasksToday]);

  // Weekly overview
  const weeklyOverview = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      
      // Count feeding plans for this day
      const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][date.getDay()];
      const feedingCount = feedingPlans?.filter(p => p.is_active && p.days.includes(dayName)).length || 0;
      
      return {
        day,
        date: dateStr,
        tasks: dayTasks.length + feedingCount,
        completed,
        isToday: dateStr === today.toISOString().split('T')[0],
      };
    });
  }, [tasks, feedingPlans]);

  // Upcoming tasks including feeding plans
  const allUpcomingTasks = useMemo(() => {
    const upcoming = upcomingTasks.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      date: t.due_date,
      time: t.due_time,
      source: 'manual',
    }));
    
    return upcoming.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [upcomingTasks]);

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'text-green-600 bg-green-100';
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      case 'health': return 'text-red-600 bg-red-100';
      case 'purchase': return 'text-purple-600 bg-purple-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      case 'sale': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feeding': return 'Nourrissage';
      case 'monitoring': return 'Surveillance';
      case 'health': return 'Santé';
      case 'purchase': return 'Achat';
      case 'maintenance': return 'Maintenance';
      case 'sale': return 'Vente';
      default: return type;
    }
  };

  const completedToday = allTodayTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Planification & Organisation</h2>
              <p className="text-purple-100">Gestion complète des tâches quotidiennes, hebdomadaires et mensuelles</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{allTodayTasks.length}</div>
                <div className="text-sm text-purple-100">Tâches aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedToday}</div>
                <div className="text-sm text-purple-100">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{feedingPlanTasksToday.length}</div>
                <div className="text-sm text-purple-100">Nourrissages</div>
              </div>
            </div>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      <Tabs defaultValue="scheduler" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scheduler">Planificateur</TabsTrigger>
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="week">Cette Semaine</TabsTrigger>
          <TabsTrigger value="upcoming">À Venir</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduler">
          <TaskScheduler />
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Programme du Jour - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>

          {allTodayTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                <p>Aucune tâche programmée pour aujourd'hui</p>
                <p className="text-sm mt-2">Ajoutez des tâches dans le planificateur ou activez des planifications d'alimentation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allTodayTasks.map((task) => (
                <Card key={task.id} className={`border-l-4 ${
                  task.status === 'completed' ? 'border-l-green-500 bg-green-50' : 
                  task.source === 'feeding_plan' ? 'border-l-green-400' : 'border-l-blue-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-mono font-bold text-gray-600">
                          {task.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{task.title}</h4>
                            {task.source === 'feeding_plan' && (
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                <Utensils className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <Badge className={`${getTaskTypeColor(task.type)} text-xs mt-1`}>
                            {getTypeLabel(task.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'completed' ? (
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Vue Hebdomadaire
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weeklyOverview.map((day, index) => (
              <Card key={index} className={`text-center ${day.isToday ? 'ring-2 ring-purple-500' : ''}`}>
                <CardHeader className="pb-2 px-2">
                  <CardTitle className="text-sm">{day.day}</CardTitle>
                  <p className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-3">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">
                      {day.tasks}
                    </div>
                    <div className="text-xs text-gray-600">
                      Tâches
                    </div>
                    {day.tasks > 0 && (
                      <>
                        <div className="text-sm font-semibold text-green-600">
                          {day.completed}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all" 
                            style={{ width: `${day.tasks > 0 ? (day.completed / day.tasks) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Tâches à Venir (24h)
            </h3>
          </div>

          {allUpcomingTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <p>Aucune tâche à venir dans les 24 prochaines heures</p>
                <p className="text-sm mt-2">Les tâches futures apparaîtront ici</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allUpcomingTasks.map((task, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <div className="text-sm font-bold text-blue-600">
                            {new Date(task.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(task.date).toLocaleDateString('fr-FR', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{task.title}</h4>
                            <span className="text-sm text-gray-500">{task.time}</span>
                          </div>
                          <Badge className={`${getTaskTypeColor(task.type)} text-xs mt-1`}>
                            {getTypeLabel(task.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Dans {Math.max(1, Math.ceil((new Date(`${task.date}T${task.time}`).getTime() - new Date().getTime()) / (1000 * 60 * 60)))}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningManagement;
