
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell, Thermometer, Fish, Activity, Droplets } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const AlertsPanel = () => {
  const { activeUnit } = useProductionUnits();

  // Alertes génériques
  const globalAlerts = [
    {
      id: 'global-1',
      type: 'info',
      title: 'Système opérationnel',
      message: 'Tous les systèmes fonctionnent normalement',
      time: '10 min ago',
      action: 'Voir détails',
      icon: CheckCircle
    }
  ];

  // Alertes spécifiques par unité
  const getUnitSpecificAlerts = () => {
    if (!activeUnit) return [];

    switch (activeUnit.type) {
      case 'ecloserie':
        return [
          {
            id: 'eclo-1',
            type: 'warning',
            title: 'Température élevée - Bassin incubation',
            message: 'Température de 28.5°C détectée dans le bassin d\'incubation A',
            time: '5 min ago',
            action: 'Régler thermostat',
            icon: Thermometer
          },
          {
            id: 'eclo-2',
            type: 'info',
            title: 'Éclosion prévue',
            message: 'Prochaine éclosion prévue dans 48h pour le lot B2024',
            time: '1h ago',
            action: 'Préparer matériel',
            icon: Fish
          },
          {
            id: 'eclo-3',
            type: 'success',
            title: 'Taux de fécondité excellent',
            message: 'Taux de fécondité de 89% atteint ce cycle (+3% vs normal)',
            time: '2h ago',
            action: 'Voir rapport',
            icon: Activity
          }
        ];

      case 'grossissement':
        return [
          {
            id: 'gross-1',
            type: 'critical',
            title: 'Niveau d\'oxygène bas - Bassin C',
            message: 'Le niveau d\'oxygène dans le bassin C est descendu à 5.2 mg/L',
            time: '5 min ago',
            action: 'Activer aération',
            icon: Droplets
          },
          {
            id: 'gross-2',
            type: 'warning',
            title: 'Mortalité légèrement élevée',
            message: 'Taux de mortalité de 2.8% observé cette semaine',
            time: '30 min ago',
            action: 'Analyser causes',
            icon: Fish
          }
        ];

      case 'transformation':
        return [
          {
            id: 'transf-1',
            type: 'info',
            title: 'Maintenance four électrique',
            message: 'Maintenance préventive du four électrique prévue demain',
            time: '1h ago',
            action: 'Programmer',
            icon: Activity
          },
          {
            id: 'transf-2',
            type: 'success',
            title: 'Objectif de production atteint',
            message: '2,450 kg transformés cette semaine (objectif: 2,400 kg)',
            time: '3h ago',
            action: 'Voir détails',
            icon: CheckCircle
          }
        ];

      case 'conservation':
        return [
          {
            id: 'cons-1',
            type: 'warning',
            title: 'Température chambre froide A',
            message: 'Température remontée à -1°C dans la chambre froide A',
            time: '15 min ago',
            action: 'Vérifier système',
            icon: Thermometer
          },
          {
            id: 'cons-2',
            type: 'info',
            title: 'Capacité stockage',
            message: 'Capacité de stockage utilisée à 85% (1,700/2,000 kg)',
            time: '2h ago',
            action: 'Planifier évacuation',
            icon: Info
          }
        ];

      case 'fabrication_aliment':
        return [
          {
            id: 'alim-1',
            type: 'warning',
            title: 'Stock matière première faible',
            message: 'Stock de farine de poisson inférieur à 500 kg',
            time: '45 min ago',
            action: 'Commander',
            icon: AlertTriangle
          }
        ];

      case 'commercialisation':
        return [
          {
            id: 'comm-1',
            type: 'info',
            title: 'Commande importante',
            message: 'Nouvelle commande de 1,500 kg reçue pour livraison vendredi',
            time: '2h ago',
            action: 'Préparer livraison',
            icon: Info
          }
        ];

      default:
        return [];
    }
  };

  const unitAlerts = getUnitSpecificAlerts();
  const allAlerts = [...unitAlerts, ...globalAlerts];

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
          iconClass: 'text-red-600',
          bgClass: 'bg-red-50 border-red-200',
          label: 'Critique'
        };
      case 'warning':
        return {
          badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconClass: 'text-yellow-600',
          bgClass: 'bg-yellow-50 border-yellow-200',
          label: 'Attention'
        };
      case 'info':
        return {
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600',
          bgClass: 'bg-blue-50 border-blue-200',
          label: 'Information'
        };
      case 'success':
        return {
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
          iconClass: 'text-green-600',
          bgClass: 'bg-green-50 border-green-200',
          label: 'Succès'
        };
      default:
        return {
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClass: 'text-gray-600',
          bgClass: 'bg-gray-50 border-gray-200',
          label: 'Info'
        };
    }
  };

  if (allAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Aucune alerte pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-aqua-600" />
            <span className="text-sm sm:text-base">
              Alertes {activeUnit ? `- ${activeUnit.name}` : ''}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {allAlerts.length} nouvelle{allAlerts.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allAlerts.map(alert => {
            const config = getAlertConfig(alert.type);
            const IconComponent = alert.icon;
            
            return (
              <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${config.bgClass} hover:shadow-sm transition-shadow`}>
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {alert.time}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${config.badgeClass} text-xs`}>
                        {config.label}
                      </Badge>
                      
                      <Button variant="outline" size="sm" className="text-xs">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
