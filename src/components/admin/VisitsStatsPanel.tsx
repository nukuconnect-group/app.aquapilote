import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Eye, Users, Clock, Globe, TrendingUp, Calendar, Headphones, MessageSquare, CheckCircle, Smartphone, Tablet, Monitor, HelpCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { format, subDays, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import { getDeviceTypeLabel } from '@/lib/deviceDetection';

interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  ticketsByCategory: { name: string; value: number }[];
  ticketsByPriority: { name: string; value: number; color: string }[];
  ticketsByDevice: { name: string; value: number; color: string }[];
}

interface CountryStats {
  country: string;
  countryCode: string;
  visits: number;
}

interface DeviceStats {
  deviceType: string;
  count: number;
  percentage: number;
}

const DEVICE_COLORS: Record<string, string> = {
  phone: 'hsl(var(--primary))',
  tablet: '#8b5cf6',
  desktop: 'hsl(var(--aqua-primary))',
  other: 'hsl(var(--muted-foreground))'
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--aqua-primary))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))', '#8b5cf6', '#f59e0b'];

const VisitsStatsPanel: React.FC = () => {
  const { t, language } = useSettings();
  const [visitStats, setVisitStats] = useState<VisitStats>({
    totalVisits: 0,
    uniqueVisitors: 0,
    averageSessionDuration: 0,
    todayVisits: 0,
    weeklyVisits: 0,
    monthlyVisits: 0
  });
  const [supportStats, setSupportStats] = useState<SupportStats>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    ticketsByCategory: [],
    ticketsByPriority: [],
    ticketsByDevice: []
  });
  const [dailyVisits, setDailyVisits] = useState<{ date: string; visits: number; uniqueUsers: number }[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitStats = useCallback(async () => {
    try {
      // Get all sessions for statistics
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .order('login_at', { ascending: false });

      if (!sessions) return;

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = subDays(now, 7);
      const monthStart = subDays(now, 30);

      // Calculate session durations
      const sessionDurations = sessions
        .filter(s => s.logout_at)
        .map(s => differenceInMinutes(new Date(s.logout_at!), new Date(s.login_at)))
        .filter(d => d > 0 && d < 480); // Filter out unrealistic durations (>8h)

      const avgDuration = sessionDurations.length > 0
        ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
        : 0;

      // Unique users
      const uniqueUserIds = new Set(sessions.map(s => s.user_id));

      // Today's visits
      const todayVisits = sessions.filter(s => 
        new Date(s.login_at) >= todayStart
      ).length;

      // Weekly visits
      const weeklyVisits = sessions.filter(s => 
        new Date(s.login_at) >= weekStart
      ).length;

      // Monthly visits
      const monthlyVisits = sessions.filter(s => 
        new Date(s.login_at) >= monthStart
      ).length;

      setVisitStats({
        totalVisits: sessions.length,
        uniqueVisitors: uniqueUserIds.size,
        averageSessionDuration: avgDuration,
        todayVisits,
        weeklyVisits,
        monthlyVisits
      });

      // Daily visits for chart (last 14 days)
      const dailyData: { date: string; visits: number; uniqueUsers: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const day = subDays(now, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        const daySessions = sessions.filter(s => {
          const loginDate = new Date(s.login_at);
          return loginDate >= dayStart && loginDate <= dayEnd;
        });
        
        const uniqueUsersThisDay = new Set(daySessions.map(s => s.user_id));
        
        dailyData.push({
          date: format(day, 'dd/MM', { locale: fr }),
          visits: daySessions.length,
          uniqueUsers: uniqueUsersThisDay.size
        });
      }
      setDailyVisits(dailyData);

      // Country statistics
      const countryCounts: Record<string, { country: string; countryCode: string; count: number }> = {};
      sessions.forEach(s => {
        const country = (s as any).country || 'Inconnu';
        const countryCode = (s as any).country_code || 'XX';
        if (!countryCounts[country]) {
          countryCounts[country] = { country, countryCode, count: 0 };
        }
        countryCounts[country].count++;
      });
      const sortedCountries = Object.values(countryCounts)
        .map(c => ({ country: c.country, countryCode: c.countryCode, visits: c.count }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
      setCountryStats(sortedCountries);

      // Device statistics
      const deviceCounts: Record<string, number> = { phone: 0, tablet: 0, desktop: 0, other: 0 };
      sessions.forEach(s => {
        const deviceType = (s as any).device_type || 'other';
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });
      const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const deviceData = Object.entries(deviceCounts)
        .filter(([_, count]) => count > 0)
        .map(([deviceType, count]) => ({
          deviceType,
          count,
          percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
        }));
      setDeviceStats(deviceData);

    } catch (error) {
      console.error('Error loading visit stats:', error);
    }
  }, []);

  const loadSupportStats = useCallback(async () => {
    try {
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tickets) return;

      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

      // Calculate average response time (in hours)
      const respondedTickets = tickets.filter(t => t.responded_at);
      const avgResponseTime = respondedTickets.length > 0
        ? Math.round(respondedTickets.reduce((acc, t) => {
            const created = new Date(t.created_at);
            const responded = new Date(t.responded_at!);
            return acc + differenceInMinutes(responded, created) / 60;
          }, 0) / respondedTickets.length)
        : 0;

      // Tickets by category
      const categoryCount: Record<string, number> = {};
      tickets.forEach(t => {
        const cat = t.category || 'Autre';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const ticketsByCategory = Object.entries(categoryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Tickets by priority
      const priorityColors: Record<string, string> = {
        'low': 'hsl(var(--muted-foreground))',
        'normal': 'hsl(var(--primary))',
        'high': '#f59e0b',
        'urgent': 'hsl(var(--destructive))'
      };
      const priorityLabels: Record<string, string> = {
        'low': 'Basse',
        'normal': 'Normale',
        'high': 'Haute',
        'urgent': 'Urgente'
      };
      const priorityCount: Record<string, number> = {};
      tickets.forEach(t => {
        const priority = t.priority || 'normal';
        priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      });
      const ticketsByPriority = Object.entries(priorityCount)
        .map(([name, value]) => ({ 
          name: priorityLabels[name] || name, 
          value,
          color: priorityColors[name] || 'hsl(var(--muted-foreground))'
        }));

      setSupportStats({
        totalTickets: tickets.length,
        openTickets,
        resolvedTickets,
        avgResponseTime,
        ticketsByCategory,
        ticketsByPriority,
        ticketsByDevice: [] // Will be populated from user_sessions if needed
      });

    } catch (error) {
      console.error('Error loading support stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([loadVisitStats(), loadSupportStats()]);
      setIsLoading(false);
    };
    loadAll();
  }, [loadVisitStats, loadSupportStats]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des statistiques...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visits" className="gap-2">
            <Eye className="w-4 h-4" />
            Visites
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <Headphones className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4 mt-4">
          {/* Visit Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{visitStats.totalVisits}</p>
                <p className="text-xs text-muted-foreground">Visites totales</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-aqua-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{visitStats.uniqueVisitors}</p>
                <p className="text-xs text-muted-foreground">Utilisateurs uniques</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{visitStats.averageSessionDuration}m</p>
                <p className="text-xs text-muted-foreground">Session moyenne</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{visitStats.todayVisits}</p>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{visitStats.weeklyVisits}</p>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{visitStats.monthlyVisits}</p>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Device & Country Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Appareils utilisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceStats.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={deviceStats.map(d => ({
                            name: getDeviceTypeLabel(d.deviceType, language === 'en' ? 'en' : 'fr'),
                            value: d.count,
                            color: DEVICE_COLORS[d.deviceType] || DEVICE_COLORS.other
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={65}
                          dataKey="value"
                        >
                          {deviceStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.deviceType] || DEVICE_COLORS.other} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3">
                      {deviceStats.map((device) => (
                        <div key={device.deviceType} className="flex items-center gap-2">
                          {device.deviceType === 'phone' && <Smartphone className="w-4 h-4 text-primary" />}
                          {device.deviceType === 'tablet' && <Tablet className="w-4 h-4 text-purple-500" />}
                          {device.deviceType === 'desktop' && <Monitor className="w-4 h-4 text-aqua-primary" />}
                          {device.deviceType === 'other' && <HelpCircle className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm">
                            {getDeviceTypeLabel(device.deviceType, language === 'en' ? 'en' : 'fr')}: {device.count} ({device.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée d'appareil</p>
                )}
              </CardContent>
            </Card>

            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pays des visiteurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {countryStats.length > 0 ? (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {countryStats.map((country, index) => {
                      const maxVisits = countryStats[0]?.visits || 1;
                      const percentage = Math.round((country.visits / maxVisits) * 100);
                      return (
                        <div key={country.country} className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 text-center text-xs">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                {country.country}
                              </span>
                              <span className="text-sm text-muted-foreground">{country.visits} visites</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée de pays</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visits Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution des visites (14 derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Connexions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueUsers" 
                    stroke="hsl(var(--aqua-primary))" 
                    strokeWidth={2}
                    name="Utilisateurs uniques"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4 mt-4">
          {/* Support Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{supportStats.totalTickets}</p>
                <p className="text-xs text-muted-foreground">Tickets total</p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="p-4 text-center">
                <Headphones className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{supportStats.openTickets}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{supportStats.resolvedTickets}</p>
                <p className="text-xs text-muted-foreground">Résolus</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{supportStats.avgResponseTime}h</p>
                <p className="text-xs text-muted-foreground">Temps réponse moy.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tickets by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tickets par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {supportStats.ticketsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={supportStats.ticketsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucun ticket</p>
                )}
              </CardContent>
            </Card>

            {/* Tickets by Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tickets par priorité</CardTitle>
              </CardHeader>
              <CardContent>
                {supportStats.ticketsByPriority.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={supportStats.ticketsByPriority}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {supportStats.ticketsByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucun ticket</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisitsStatsPanel;
