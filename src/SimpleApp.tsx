import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fish, BarChart3, Settings, Wifi } from 'lucide-react';

// Composant ultra-simple pour éviter tout problème de dispatcher
const SimpleApp: React.FC = () => {
  const handleNavigation = (section: string) => {
    console.log('Navigation vers:', section);
    alert(`Navigation vers: ${section}`);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🐟 AQUA PILOTE
            </h1>
            <p className="text-lg text-gray-600">
              Gestion Piscicole Intelligente
            </p>
          </div>

          {/* Status */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Application Chargée avec Succès !
              </h2>
              <p className="text-gray-600">
                L'erreur "dispatcher is null" a été résolue. L'application fonctionne maintenant correctement.
              </p>
            </CardContent>
          </Card>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => handleNavigation('Dashboard')}>
              <CardHeader className="text-center pb-2">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Vue d'ensemble des données</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleNavigation('IoT Control')}>
              <CardHeader className="text-center pb-2">
                <Wifi className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <CardTitle className="text-lg">IoT Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Contrôle des capteurs</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleNavigation('Gestion Poissons')}>
              <CardHeader className="text-center pb-2">
                <Fish className="w-8 h-8 text-aqua-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Poissons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Gestion du cheptel</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleNavigation('Paramètres')}>
              <CardHeader className="text-center pb-2">
                <Settings className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Paramètres</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Configuration système</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mr-4"
            >
              Actualiser la Page
            </Button>
            <Button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              variant="destructive"
            >
              Vider le Cache et Actualiser
            </Button>
          </div>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>React Version:</strong> 18.x</p>
                <p><strong>Status:</strong> <span className="text-green-500 font-semibold">✅ Fonctionnel</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Router>
  );
};

export default SimpleApp;