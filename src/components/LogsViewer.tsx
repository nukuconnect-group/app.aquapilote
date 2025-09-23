
import React, { useState } from 'react';
import { History, Filter, Download, Trash2, Eye, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLogs } from '@/contexts/LogsContext';

const LogsViewer = () => {
  const { logs, clearLogs } = useLogs();
  const [filterModule, setFilterModule] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesModule && matchesSeverity && matchesSearch;
  });

  const modules = [...new Set(logs.map(log => log.module))];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Utilisateur,Module,Action,Détails,Sévérité\n" +
      filteredLogs.map(log => 
        `"${new Date(log.timestamp).toLocaleString('fr-FR')}","${log.userName}","${log.module}","${log.action}","${log.details}","${log.severity}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs_aqua_pilote_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal des Activités</h2>
          <p className="text-gray-600">Historique complet des actions du système</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={clearLogs}>
            <Trash2 className="w-4 h-4 mr-2" />
            Vider
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recherche</label>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sévérité</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="secondary" className="h-fit">
                {filteredLogs.length} entrée(s)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Activités</CardTitle>
          <CardDescription>
            Logs système en temps réel - {logs.length} entrées totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun log trouvé</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(log.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(log.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{log.action}</h4>
                            <Badge variant="outline" className="text-xs">
                              {log.module}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Par: {log.userName}</span>
                            <span>
                              {new Date(log.timestamp).toLocaleString('fr-FR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Détails du Log</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">ID</label>
                              <p className="text-sm text-gray-600">{log.id}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Timestamp</label>
                              <p className="text-sm text-gray-600">{log.timestamp}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Utilisateur</label>
                              <p className="text-sm text-gray-600">{log.userName} (ID: {log.userId})</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Module</label>
                              <p className="text-sm text-gray-600">{log.module}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Action</label>
                              <p className="text-sm text-gray-600">{log.action}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Détails</label>
                              <p className="text-sm text-gray-600">{log.details}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Sévérité</label>
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(log.severity)}
                                <span className="text-sm">{log.severity}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsViewer;
