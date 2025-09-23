import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle, MapPin, Navigation } from 'lucide-react';

interface WeatherData {
  zone: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  uvIndex: number;
  pressure: number;
  forecast: {
    day: string;
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    precipitation: number;
  }[];
}

interface WeatherAlert {
  type: 'rain' | 'storm' | 'drought' | 'flood';
  severity: 'low' | 'medium' | 'high';
  message: string;
  zone: string;
  timeLeft: string;
}

const WeatherDashboard = () => {
  const [selectedZone, setSelectedZone] = useState('auto');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const zones = [
    { id: 'auto', name: 'Ma position actuelle', coordinates: 'Géolocalisé' },
    { id: 'nord', name: 'Zone Nord', coordinates: '45.5°N, 2.3°E' },
    { id: 'sud', name: 'Zone Sud', coordinates: '44.2°N, 1.8°E' },
    { id: 'est', name: 'Zone Est', coordinates: '45.1°N, 3.1°E' },
    { id: 'ouest', name: 'Zone Ouest', coordinates: '45.3°N, 1.2°E' },
    { id: 'lomé', name: 'Lomé, Togo', coordinates: '6.1319°N, 1.2228°E' },
    { id: 'kara', name: 'Kara, Togo', coordinates: '9.5511°N, 1.1872°E' },
    { id: 'sokodé', name: 'Sokodé, Togo', coordinates: '8.9667°N, 1.1333°E' },
    { id: 'atakpamé', name: 'Atakpamé, Togo', coordinates: '7.5264°N, 1.1258°E' }
  ];

  const weatherDatabase: Record<string, WeatherData> = {
    auto: {
      zone: 'Ma position',
      temperature: 26.3,
      humidity: 75,
      precipitation: 8.2,
      windSpeed: 12.1,
      condition: 'cloudy',
      uvIndex: 7,
      pressure: 1012.5,
      forecast: [
        { day: 'Aujourd\'hui', temp: 26, condition: 'cloudy', precipitation: 8 },
        { day: 'Demain', temp: 28, condition: 'rainy', precipitation: 15 },
        { day: 'Après-demain', temp: 25, condition: 'rainy', precipitation: 12 },
        { day: 'Dans 3 jours', temp: 27, condition: 'sunny', precipitation: 3 },
        { day: 'Dans 4 jours', temp: 29, condition: 'sunny', precipitation: 1 }
      ]
    },
    nord: {
      zone: 'Zone Nord',
      temperature: 24.5,
      humidity: 68,
      precipitation: 12.3,
      windSpeed: 15.2,
      condition: 'cloudy',
      uvIndex: 6,
      pressure: 1013.2,
      forecast: [
        { day: 'Aujourd\'hui', temp: 24, condition: 'cloudy', precipitation: 12 },
        { day: 'Demain', temp: 26, condition: 'rainy', precipitation: 25 },
        { day: 'Après-demain', temp: 22, condition: 'rainy', precipitation: 18 },
        { day: 'Dans 3 jours', temp: 25, condition: 'sunny', precipitation: 2 },
        { day: 'Dans 4 jours', temp: 27, condition: 'sunny', precipitation: 0 }
      ]
    },
    sud: {
      zone: 'Zone Sud',
      temperature: 28.1,
      humidity: 45,
      precipitation: 2.1,
      windSpeed: 8.5,
      condition: 'sunny',
      uvIndex: 8,
      pressure: 1018.5,
      forecast: [
        { day: 'Aujourd\'hui', temp: 28, condition: 'sunny', precipitation: 2 },
        { day: 'Demain', temp: 30, condition: 'sunny', precipitation: 0 },
        { day: 'Après-demain', temp: 29, condition: 'cloudy', precipitation: 5 },
        { day: 'Dans 3 jours', temp: 26, condition: 'rainy', precipitation: 15 },
        { day: 'Dans 4 jours', temp: 24, condition: 'rainy', precipitation: 22 }
      ]
    },
    est: {
      zone: 'Zone Est',
      temperature: 22.8,
      humidity: 72,
      precipitation: 18.7,
      windSpeed: 12.3,
      condition: 'rainy',
      uvIndex: 4,
      pressure: 1009.8,
      forecast: [
        { day: 'Aujourd\'hui', temp: 23, condition: 'rainy', precipitation: 19 },
        { day: 'Demain', temp: 21, condition: 'stormy', precipitation: 35 },
        { day: 'Après-demain', temp: 20, condition: 'rainy', precipitation: 28 },
        { day: 'Dans 3 jours', temp: 23, condition: 'cloudy', precipitation: 8 },
        { day: 'Dans 4 jours', temp: 25, condition: 'sunny', precipitation: 1 }
      ]
    },
    ouest: {
      zone: 'Zone Ouest',
      temperature: 25.3,
      humidity: 58,
      precipitation: 8.4,
      windSpeed: 18.7,
      condition: 'cloudy',
      uvIndex: 5,
      pressure: 1015.1,
      forecast: [
        { day: 'Aujourd\'hui', temp: 25, condition: 'cloudy', precipitation: 8 },
        { day: 'Demain', temp: 24, condition: 'rainy', precipitation: 14 },
        { day: 'Après-demain', temp: 26, condition: 'cloudy', precipitation: 6 },
        { day: 'Dans 3 jours', temp: 28, condition: 'sunny', precipitation: 0 },
        { day: 'Dans 4 jours', temp: 29, condition: 'sunny', precipitation: 0 }
      ]
    },
    lomé: {
      zone: 'Lomé',
      temperature: 29.5,
      humidity: 78,
      precipitation: 15.3,
      windSpeed: 14.2,
      condition: 'rainy',
      uvIndex: 9,
      pressure: 1011.8,
      forecast: [
        { day: 'Aujourd\'hui', temp: 29, condition: 'rainy', precipitation: 15 },
        { day: 'Demain', temp: 31, condition: 'stormy', precipitation: 28 },
        { day: 'Après-demain', temp: 28, condition: 'rainy', precipitation: 22 },
        { day: 'Dans 3 jours', temp: 30, condition: 'cloudy', precipitation: 8 },
        { day: 'Dans 4 jours', temp: 32, condition: 'sunny', precipitation: 2 }
      ]
    },
    kara: {
      zone: 'Kara',
      temperature: 27.2,
      humidity: 65,
      precipitation: 9.8,
      windSpeed: 11.5,
      condition: 'cloudy',
      uvIndex: 7,
      pressure: 1014.2,
      forecast: [
        { day: 'Aujourd\'hui', temp: 27, condition: 'cloudy', precipitation: 10 },
        { day: 'Demain', temp: 29, condition: 'rainy', precipitation: 18 },
        { day: 'Après-demain', temp: 26, condition: 'rainy', precipitation: 14 },
        { day: 'Dans 3 jours', temp: 28, condition: 'sunny', precipitation: 3 },
        { day: 'Dans 4 jours', temp: 30, condition: 'sunny', precipitation: 1 }
      ]
    },
    sokodé: {
      zone: 'Sokodé',
      temperature: 26.8,
      humidity: 70,
      precipitation: 12.1,
      windSpeed: 9.8,
      condition: 'rainy',
      uvIndex: 6,
      pressure: 1013.5,
      forecast: [
        { day: 'Aujourd\'hui', temp: 27, condition: 'rainy', precipitation: 12 },
        { day: 'Demain', temp: 25, condition: 'stormy', precipitation: 25 },
        { day: 'Après-demain', temp: 24, condition: 'rainy', precipitation: 20 },  
        { day: 'Dans 3 jours', temp: 26, condition: 'cloudy', precipitation: 7 },
        { day: 'Dans 4 jours', temp: 28, condition: 'sunny', precipitation: 2 }
      ]
    },
    atakpamé: {
      zone: 'Atakpamé',
      temperature: 25.9,
      humidity: 72,
      precipitation: 11.5,
      windSpeed: 10.3,
      condition: 'cloudy',
      uvIndex: 6,
      pressure: 1012.9,
      forecast: [
        { day: 'Aujourd\'hui', temp: 26, condition: 'cloudy', precipitation: 11 },
        { day: 'Demain', temp: 27, condition: 'rainy', precipitation: 17 },
        { day: 'Après-demain', temp: 24, condition: 'rainy', precipitation: 19 },
        { day: 'Dans 3 jours', temp: 26, condition: 'sunny', precipitation: 4 },
        { day: 'Dans 4 jours', temp: 28, condition: 'sunny', precipitation: 1 }
      ]
    }
  };

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setSelectedZone('auto');
          setIsLocating(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsLocating(false);
        }
      );
    } else {
      console.error('Géolocalisation non supportée');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const loadWeatherData = () => {
      setWeatherData(weatherDatabase[selectedZone]);
      
      const newAlerts: WeatherAlert[] = [];
      const data = weatherDatabase[selectedZone];
      
      if (data.precipitation > 15) {
        newAlerts.push({
          type: 'rain',
          severity: data.precipitation > 25 ? 'high' : 'medium',
          message: `Fortes précipitations prévues: ${data.precipitation}mm`,
          zone: data.zone,
          timeLeft: '2-6h'
        });
      }
      
      if (data.windSpeed > 15) {
        newAlerts.push({
          type: 'storm',
          severity: 'medium',
          message: `Vents forts: ${data.windSpeed} km/h`,
          zone: data.zone,
          timeLeft: '1-4h'
        });
      }
      
      if (data.precipitation < 5 && data.temperature > 27) {
        newAlerts.push({
          type: 'drought',
          severity: 'low',
          message: 'Conditions sèches, surveillance hydrique recommandée',
          zone: data.zone,
          timeLeft: 'permanent'
        });
      }
      
      setAlerts(newAlerts);
    };

    loadWeatherData();
  }, [selectedZone]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'stormy': return <CloudRain className="w-6 h-6 text-purple-500" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-4 h-4" />;
      case 'storm': return <Wind className="w-4 h-4" />;
      case 'drought': return <Sun className="w-4 h-4" />;
      case 'flood': return <Droplets className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!weatherData) return <div>Chargement...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Météo Agricole</h2>
          <p className="text-sm sm:text-base text-gray-600">Surveillance météorologique pour vos zones d'exploitation</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getLocation}
              disabled={isLocating}
              className="text-xs sm:text-sm"
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {isLocating ? 'Localisation...' : 'Ma position'}
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Conditions actuelles */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {getWeatherIcon(weatherData.condition)}
            <span className="text-sm sm:text-base">Conditions actuelles - {weatherData.zone}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="text-center">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-orange-500" />
              <p className="text-lg sm:text-2xl font-bold">{weatherData.temperature}°C</p>
              <p className="text-xs sm:text-sm text-gray-600">Température</p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500" />
              <p className="text-lg sm:text-2xl font-bold">{weatherData.humidity}%</p>
              <p className="text-xs sm:text-sm text-gray-600">Humidité</p>
            </div>
            <div className="text-center">
              <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-lg sm:text-2xl font-bold">{weatherData.precipitation}mm</p>
              <p className="text-xs sm:text-sm text-gray-600">Précipitations</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-500" />
              <p className="text-lg sm:text-2xl font-bold">{weatherData.windSpeed}km/h</p>
              <p className="text-xs sm:text-sm text-gray-600">Vent</p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500" />
              <p className="text-lg sm:text-2xl font-bold">{weatherData.uvIndex}</p>
              <p className="text-xs sm:text-sm text-gray-600">Index UV</p>
            </div>
            <div className="text-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold">{weatherData.pressure}</p>
              <p className="text-xs sm:text-sm text-gray-600">Pression (hPa)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes météo */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-sm sm:text-base">Alertes Météorologiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg ${getAlertColor(alert.severity)}`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{alert.message}</p>
                    <p className="text-xs sm:text-sm opacity-75">
                      {alert.zone} • Échéance: {alert.timeLeft}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity === 'high' ? 'Élevé' : 
                     alert.severity === 'medium' ? 'Moyen' : 'Faible'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prévisions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Prévisions 5 jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 sm:p-3 border rounded-lg">
                <p className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">{day.day}</p>
                {getWeatherIcon(day.condition)}
                <p className="text-base sm:text-lg font-bold mt-1 sm:mt-2">{day.temp}°C</p>
                <p className="text-xs sm:text-sm text-blue-600">{day.precipitation}mm</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zones à forte pluviométrie */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Surveillance Pluviométrique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {zones.filter(zone => zone.id !== 'auto').map((zone) => {
              const zoneData = weatherDatabase[zone.id];
              const isHighRain = zoneData.precipitation > 15;
              return (
                <div 
                  key={zone.id} 
                  className={`p-2 sm:p-3 border rounded-lg ${
                    isHighRain ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h4 className="font-medium text-sm sm:text-base">{zone.name}</h4>
                    {isHighRain && <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {zoneData.precipitation}mm
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{zone.coordinates}</p>
                  {isHighRain && (
                    <Badge className="mt-1 sm:mt-2 bg-blue-100 text-blue-800 text-xs">
                      Zone à risque
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherDashboard;
