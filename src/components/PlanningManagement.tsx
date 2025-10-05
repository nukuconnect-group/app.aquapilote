
import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskScheduler from './planning/TaskScheduler';
import ProductionUnitSelector from './ProductionUnitSelector';

const PlanningManagement = () => {
  const [selectedView, setSelectedView] = useState('day');

  const todayTasks = [
    { id: 1, time: '08:00', title: 'Nourrissage matinal', type: 'feeding', status: 'pending' },
    { id: 2, time: '10:00', title: 'Contrôle qualité eau', type: 'monitoring', status: 'completed' },
    { id: 3, time: '14:00', title: 'Administration médicament', type: 'health', status: 'pending' },
    { id: 4, time: '16:00', title: 'Nourrissage vespéral', type: 'feeding', status: 'pending' }
  ];

  const weeklyOverview = [
    { day: 'Lun', tasks: 8, completed: 6 },
    { day: 'Mar', tasks: 6, completed: 6 },
    { day: 'Mer', tasks: 7, completed: 4 },
    { day: 'Jeu', tasks: 9, completed: 2 },
    { day: 'Ven', tasks: 5, completed: 0 },
    { day: 'Sam', tasks: 4, completed: 0 },
    { day: 'Dim', tasks: 3, completed: 0 }
  ];

  const upcomingTasks = [
    { date: '2024-07-05', title: 'Livraison alevins', type: 'purchase' },
    { date: '2024-07-06', title: 'Visite vétérinaire', type: 'health' },
    { date: '2024-07-08', title: 'Nettoyage filtres', type: 'maintenance' }
  ];

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'text-green-600 bg-green-100';
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      case 'health': return 'text-red-600 bg-red-100';
      case 'purchase': return 'text-purple-600 bg-purple-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Planification & Organisation</h2>
              <p className="text-purple-100">Gestion complète des tâches quotidiennes, hebdomadaires et mensuelles</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-purple-100">Tâches aujourd'hui</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-purple-100">Terminées</div>
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
              Programme du Jour - {new Date().toLocaleDateString('fr-FR')}
            </h3>
          </div>

          <div className="grid gap-4">
            {todayTasks.map((task) => (
              <Card key={task.id} className={`border-l-4 ${
                task.status === 'completed' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-mono font-bold text-gray-600">
                        {task.time}
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
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
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Vue Hebdomadaire
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weeklyOverview.map((day, index) => (
              <Card key={index} className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{day.day}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {day.tasks}
                    </div>
                    <div className="text-xs text-gray-600">
                      Tâches totales
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {day.completed}
                    </div>
                    <div className="text-xs text-gray-600">
                      Terminées
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(day.completed / day.tasks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Tâches à Venir
            </h3>
          </div>

          <div className="grid gap-4">
            {upcomingTasks.map((task, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-600">
                          {new Date(task.date).getDate()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(task.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Dans {Math.ceil((new Date(task.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningManagement;
