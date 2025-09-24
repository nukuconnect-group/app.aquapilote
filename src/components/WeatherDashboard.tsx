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
    { id: 'auto', name: 'Ma position actuelle', coordinates: 'Géolocalisé', country: 'Auto', continent: 'Auto' },
    
    // Afrique de l'Ouest
    { id: 'lomé-togo', name: 'Lomé', coordinates: '6.1319°N, 1.2228°E', country: 'Togo', continent: 'Afrique' },
    { id: 'kara-togo', name: 'Kara', coordinates: '9.5511°N, 1.1872°E', country: 'Togo', continent: 'Afrique' },
    { id: 'sokodé-togo', name: 'Sokodé', coordinates: '8.9667°N, 1.1333°E', country: 'Togo', continent: 'Afrique' },
    { id: 'atakpamé-togo', name: 'Atakpamé', coordinates: '7.5264°N, 1.1258°E', country: 'Togo', continent: 'Afrique' },
    
    { id: 'accra-ghana', name: 'Accra', coordinates: '5.6037°N, 0.1870°W', country: 'Ghana', continent: 'Afrique' },
    { id: 'kumasi-ghana', name: 'Kumasi', coordinates: '6.6885°N, 1.6244°W', country: 'Ghana', continent: 'Afrique' },
    { id: 'tamale-ghana', name: 'Tamale', coordinates: '9.4008°N, 0.8393°W', country: 'Ghana', continent: 'Afrique' },
    
    { id: 'cotonou-benin', name: 'Cotonou', coordinates: '6.3654°N, 2.4183°E', country: 'Bénin', continent: 'Afrique' },
    { id: 'porto-novo-benin', name: 'Porto-Novo', coordinates: '6.4965°N, 2.6036°E', country: 'Bénin', continent: 'Afrique' },
    
    { id: 'ouagadougou-burkina', name: 'Ouagadougou', coordinates: '12.3714°N, 1.5197°W', country: 'Burkina Faso', continent: 'Afrique' },
    { id: 'bobo-burkina', name: 'Bobo-Dioulasso', coordinates: '11.1784°N, 4.2973°W', country: 'Burkina Faso', continent: 'Afrique' },
    
    { id: 'abidjan-ci', name: 'Abidjan', coordinates: '5.3364°N, 4.0267°W', country: 'Côte d\'Ivoire', continent: 'Afrique' },
    { id: 'bouake-ci', name: 'Bouaké', coordinates: '7.6939°N, 5.0300°W', country: 'Côte d\'Ivoire', continent: 'Afrique' },
    
    { id: 'bamako-mali', name: 'Bamako', coordinates: '12.6392°N, 8.0029°W', country: 'Mali', continent: 'Afrique' },
    { id: 'sikasso-mali', name: 'Sikasso', coordinates: '11.3273°N, 5.6678°W', country: 'Mali', continent: 'Afrique' },
    
    { id: 'niamey-niger', name: 'Niamey', coordinates: '13.5116°N, 2.1254°E', country: 'Niger', continent: 'Afrique' },
    { id: 'zinder-niger', name: 'Zinder', coordinates: '13.8069°N, 8.9881°E', country: 'Niger', continent: 'Afrique' },
    
    { id: 'dakar-senegal', name: 'Dakar', coordinates: '14.7167°N, 17.4677°W', country: 'Sénégal', continent: 'Afrique' },
    { id: 'thies-senegal', name: 'Thiès', coordinates: '14.7886°N, 16.9373°W', country: 'Sénégal', continent: 'Afrique' },
    
    { id: 'conakry-guinee', name: 'Conakry', coordinates: '9.6412°N, 13.5784°W', country: 'Guinée', continent: 'Afrique' },
    { id: 'kankan-guinee', name: 'Kankan', coordinates: '10.3851°N, 9.3064°W', country: 'Guinée', continent: 'Afrique' },
    
    { id: 'monrovia-liberia', name: 'Monrovia', coordinates: '6.2907°N, 10.7605°W', country: 'Libéria', continent: 'Afrique' },
    { id: 'freetown-sierra', name: 'Freetown', coordinates: '8.4657°N, 13.2317°W', country: 'Sierra Leone', continent: 'Afrique' },
    
    // Afrique Centrale
    { id: 'yaounde-cameroun', name: 'Yaoundé', coordinates: '3.8480°N, 11.5021°E', country: 'Cameroun', continent: 'Afrique' },
    { id: 'douala-cameroun', name: 'Douala', coordinates: '4.0483°N, 9.7043°E', country: 'Cameroun', continent: 'Afrique' },
    
    { id: 'libreville-gabon', name: 'Libreville', coordinates: '0.4162°N, 9.4673°E', country: 'Gabon', continent: 'Afrique' },
    { id: 'brazzaville-congo', name: 'Brazzaville', coordinates: '4.2634°S, 15.2429°E', country: 'Congo', continent: 'Afrique' },
    { id: 'kinshasa-rdc', name: 'Kinshasa', coordinates: '4.4419°S, 15.2663°E', country: 'RD Congo', continent: 'Afrique' },
    
    { id: 'bangui-rca', name: 'Bangui', coordinates: '4.3947°N, 18.5582°E', country: 'R. Centrafricaine', continent: 'Afrique' },
    { id: 'ndjamena-tchad', name: 'N\'Djamena', coordinates: '12.1348°N, 15.0557°E', country: 'Tchad', continent: 'Afrique' },
    
    // Afrique de l'Est
    { id: 'nairobi-kenya', name: 'Nairobi', coordinates: '1.2921°S, 36.8219°E', country: 'Kenya', continent: 'Afrique' },
    { id: 'mombasa-kenya', name: 'Mombasa', coordinates: '4.0435°S, 39.6682°E', country: 'Kenya', continent: 'Afrique' },
    
    { id: 'kampala-uganda', name: 'Kampala', coordinates: '0.3476°N, 32.5825°E', country: 'Ouganda', continent: 'Afrique' },
    { id: 'dar-tanzanie', name: 'Dar es Salaam', coordinates: '6.7924°S, 39.2083°E', country: 'Tanzanie', continent: 'Afrique' },
    { id: 'dodoma-tanzanie', name: 'Dodoma', coordinates: '6.1630°S, 35.7516°E', country: 'Tanzanie', continent: 'Afrique' },
    
    { id: 'kigali-rwanda', name: 'Kigali', coordinates: '1.9441°S, 30.0619°E', country: 'Rwanda', continent: 'Afrique' },
    { id: 'bujumbura-burundi', name: 'Gitega', coordinates: '3.4264°S, 29.9306°E', country: 'Burundi', continent: 'Afrique' },
    
    { id: 'addis-ethiopie', name: 'Addis-Abeba', coordinates: '9.1450°N, 40.4894°E', country: 'Éthiopie', continent: 'Afrique' },
    { id: 'asmara-erythree', name: 'Asmara', coordinates: '15.3229°N, 38.9251°E', country: 'Érythrée', continent: 'Afrique' },
    { id: 'djibouti-djibouti', name: 'Djibouti', coordinates: '11.8251°N, 42.5903°E', country: 'Djibouti', continent: 'Afrique' },
    { id: 'mogadishu-somalie', name: 'Mogadiscio', coordinates: '2.0469°N, 45.3182°E', country: 'Somalie', continent: 'Afrique' },
    
    // Afrique du Nord
    { id: 'le-caire-egypte', name: 'Le Caire', coordinates: '30.0444°N, 31.2357°E', country: 'Égypte', continent: 'Afrique' },
    { id: 'alexandrie-egypte', name: 'Alexandrie', coordinates: '31.2001°N, 29.9187°E', country: 'Égypte', continent: 'Afrique' },
    
    { id: 'tripoli-libye', name: 'Tripoli', coordinates: '32.8872°N, 13.1913°E', country: 'Libye', continent: 'Afrique' },
    { id: 'benghazi-libye', name: 'Benghazi', coordinates: '32.1167°N, 20.0686°E', country: 'Libye', continent: 'Afrique' },
    
    { id: 'tunis-tunisie', name: 'Tunis', coordinates: '36.8065°N, 10.1815°E', country: 'Tunisie', continent: 'Afrique' },
    { id: 'sfax-tunisie', name: 'Sfax', coordinates: '34.7406°N, 10.7603°E', country: 'Tunisie', continent: 'Afrique' },
    
    { id: 'alger-algerie', name: 'Alger', coordinates: '36.7538°N, 3.0588°E', country: 'Algérie', continent: 'Afrique' },
    { id: 'oran-algerie', name: 'Oran', coordinates: '35.6969°N, 0.6331°W', country: 'Algérie', continent: 'Afrique' },
    
    { id: 'rabat-maroc', name: 'Rabat', coordinates: '34.0209°N, 6.8416°W', country: 'Maroc', continent: 'Afrique' },
    { id: 'casablanca-maroc', name: 'Casablanca', coordinates: '33.5731°N, 7.5898°W', country: 'Maroc', continent: 'Afrique' },
    { id: 'marrakech-maroc', name: 'Marrakech', coordinates: '31.6295°N, 7.9811°W', country: 'Maroc', continent: 'Afrique' },
    
    // Afrique Australe
    { id: 'cape-town-sa', name: 'Le Cap', coordinates: '33.9249°S, 18.4241°E', country: 'Afrique du Sud', continent: 'Afrique' },
    { id: 'johannesburg-sa', name: 'Johannesburg', coordinates: '26.2041°S, 28.0473°E', country: 'Afrique du Sud', continent: 'Afrique' },
    { id: 'durban-sa', name: 'Durban', coordinates: '29.8587°S, 31.0218°E', country: 'Afrique du Sud', continent: 'Afrique' },
    
    { id: 'windhoek-namibie', name: 'Windhoek', coordinates: '22.3193°S, 17.0658°E', country: 'Namibie', continent: 'Afrique' },
    { id: 'gaborone-botswana', name: 'Gaborone', coordinates: '24.6282°S, 25.9231°E', country: 'Botswana', continent: 'Afrique' },
    { id: 'harare-zimbabwe', name: 'Harare', coordinates: '17.8252°S, 31.0335°E', country: 'Zimbabwe', continent: 'Afrique' },
    { id: 'lusaka-zambie', name: 'Lusaka', coordinates: '15.3875°S, 28.3228°E', country: 'Zambie', continent: 'Afrique' },
    { id: 'maputo-mozambique', name: 'Maputo', coordinates: '25.9692°S, 32.5732°E', country: 'Mozambique', continent: 'Afrique' },
    
    // Europe
    { id: 'paris-france', name: 'Paris', coordinates: '48.8566°N, 2.3522°E', country: 'France', continent: 'Europe' },
    { id: 'lyon-france', name: 'Lyon', coordinates: '45.7640°N, 4.8357°E', country: 'France', continent: 'Europe' },
    { id: 'marseille-france', name: 'Marseille', coordinates: '43.2965°N, 5.3698°E', country: 'France', continent: 'Europe' },
    
    { id: 'london-uk', name: 'Londres', coordinates: '51.5074°N, 0.1278°W', country: 'Royaume-Uni', continent: 'Europe' },
    { id: 'berlin-germany', name: 'Berlin', coordinates: '52.5200°N, 13.4050°E', country: 'Allemagne', continent: 'Europe' },
    { id: 'madrid-spain', name: 'Madrid', coordinates: '40.4168°N, 3.7038°W', country: 'Espagne', continent: 'Europe' },
    { id: 'rome-italy', name: 'Rome', coordinates: '41.9028°N, 12.4964°E', country: 'Italie', continent: 'Europe' },
    
    // Amérique du Nord
    { id: 'new-york-usa', name: 'New York', coordinates: '40.7128°N, 74.0060°W', country: 'États-Unis', continent: 'Amérique du Nord' },
    { id: 'los-angeles-usa', name: 'Los Angeles', coordinates: '34.0522°N, 118.2437°W', country: 'États-Unis', continent: 'Amérique du Nord' },
    { id: 'chicago-usa', name: 'Chicago', coordinates: '41.8781°N, 87.6298°W', country: 'États-Unis', continent: 'Amérique du Nord' },
    { id: 'toronto-canada', name: 'Toronto', coordinates: '43.6532°N, 79.3832°W', country: 'Canada', continent: 'Amérique du Nord' },
    { id: 'vancouver-canada', name: 'Vancouver', coordinates: '49.2827°N, 123.1207°W', country: 'Canada', continent: 'Amérique du Nord' },
    
    // Asie
    { id: 'tokyo-japan', name: 'Tokyo', coordinates: '35.6762°N, 139.6503°E', country: 'Japon', continent: 'Asie' },
    { id: 'beijing-china', name: 'Pékin', coordinates: '39.9042°N, 116.4074°E', country: 'Chine', continent: 'Asie' },
    { id: 'shanghai-china', name: 'Shanghai', coordinates: '31.2304°N, 121.4737°E', country: 'Chine', continent: 'Asie' },
    { id: 'mumbai-india', name: 'Mumbai', coordinates: '19.0760°N, 72.8777°E', country: 'Inde', continent: 'Asie' },
    { id: 'delhi-india', name: 'New Delhi', coordinates: '28.6139°N, 77.2090°E', country: 'Inde', continent: 'Asie' },
    { id: 'bangkok-thailand', name: 'Bangkok', coordinates: '13.7563°N, 100.5018°E', country: 'Thaïlande', continent: 'Asie' },
    
    // Océanie
    { id: 'sydney-australia', name: 'Sydney', coordinates: '33.8688°S, 151.2093°E', country: 'Australie', continent: 'Océanie' },
    { id: 'melbourne-australia', name: 'Melbourne', coordinates: '37.8136°S, 144.9631°E', country: 'Australie', continent: 'Océanie' },
    { id: 'auckland-nz', name: 'Auckland', coordinates: '36.8485°S, 174.7633°E', country: 'Nouvelle-Zélande', continent: 'Océanie' }
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
    // Données pour toutes les zones avec des conditions météo réalistes
    'lomé-togo': {
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
    'accra-ghana': {
      zone: 'Accra',
      temperature: 28.8,
      humidity: 82,
      precipitation: 18.5,
      windSpeed: 16.3,
      condition: 'rainy',
      uvIndex: 8,
      pressure: 1010.2,
      forecast: [
        { day: 'Aujourd\'hui', temp: 29, condition: 'rainy', precipitation: 18 },
        { day: 'Demain', temp: 30, condition: 'stormy', precipitation: 25 },
        { day: 'Après-demain', temp: 27, condition: 'rainy', precipitation: 20 },
        { day: 'Dans 3 jours', temp: 28, condition: 'cloudy', precipitation: 6 },
        { day: 'Dans 4 jours', temp: 31, condition: 'sunny', precipitation: 1 }
      ]
    },
    'paris-france': {
      zone: 'Paris',
      temperature: 18.2,
      humidity: 65,
      precipitation: 3.1,
      windSpeed: 11.8,
      condition: 'cloudy',
      uvIndex: 4,
      pressure: 1015.3,
      forecast: [
        { day: 'Aujourd\'hui', temp: 18, condition: 'cloudy', precipitation: 3 },
        { day: 'Demain', temp: 20, condition: 'sunny', precipitation: 0 },
        { day: 'Après-demain', temp: 16, condition: 'rainy', precipitation: 12 },
        { day: 'Dans 3 jours', temp: 19, condition: 'cloudy', precipitation: 2 },
        { day: 'Dans 4 jours', temp: 22, condition: 'sunny', precipitation: 0 }
      ]
    },
    'new-york-usa': {
      zone: 'New York',
      temperature: 22.5,
      humidity: 58,
      precipitation: 1.2,
      windSpeed: 13.4,
      condition: 'sunny',
      uvIndex: 6,
      pressure: 1018.7,
      forecast: [
        { day: 'Aujourd\'hui', temp: 23, condition: 'sunny', precipitation: 1 },
        { day: 'Demain', temp: 25, condition: 'sunny', precipitation: 0 },
        { day: 'Après-demain', temp: 21, condition: 'cloudy', precipitation: 4 },
        { day: 'Dans 3 jours', temp: 19, condition: 'rainy', precipitation: 15 },
        { day: 'Dans 4 jours', temp: 24, condition: 'sunny', precipitation: 0 }
      ]
    }
  };

  // Fonction pour générer des données météo automatiquement pour toutes les zones non définies
  const getWeatherForZone = (zoneId: string): WeatherData => {
    if (weatherDatabase[zoneId]) {
      return weatherDatabase[zoneId];
    }
    
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return weatherDatabase.auto;
    
    // Génération automatique basée sur la région
    const isAfrica = zone.continent === 'Afrique';
    const isTropical = zone.coordinates.includes('°N') && !zone.coordinates.includes('3') && !zone.coordinates.includes('4') && isAfrica;
    
    const baseTemp = isTropical ? 28 : isAfrica ? 25 : 15;
    const baseHumidity = isTropical ? 75 : isAfrica ? 60 : 65;
    const basePrecipitation = isTropical ? 15 : isAfrica ? 8 : 5;
    
    return {
      zone: zone.name,
      temperature: baseTemp + (Math.random() * 8 - 4),
      humidity: baseHumidity + (Math.random() * 20 - 10),
      precipitation: basePrecipitation + (Math.random() * 10 - 5),
      windSpeed: 8 + Math.random() * 15,
      condition: basePrecipitation > 10 ? 'rainy' : Math.random() > 0.5 ? 'cloudy' : 'sunny',
      uvIndex: Math.floor(Math.random() * 11),
      pressure: 1010 + Math.random() * 15,
      forecast: Array.from({length: 5}, (_, i) => ({
        day: i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : i === 2 ? 'Après-demain' : `Dans ${i} jours`,
        temp: Math.round(baseTemp + (Math.random() * 6 - 3)),
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)] as 'sunny' | 'cloudy' | 'rainy',
        precipitation: Math.round(Math.random() * 20)
      }))
    };
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
      const data = getWeatherForZone(selectedZone);
      setWeatherData(data);
      
      const newAlerts: WeatherAlert[] = [];
      
      if (data.precipitation > 15) {
        newAlerts.push({
          type: 'rain',
          severity: data.precipitation > 25 ? 'high' : 'medium',
          message: `Fortes précipitations prévues: ${data.precipitation.toFixed(1)}mm`,
          zone: data.zone,
          timeLeft: '2-6h'
        });
      }
      
      if (data.windSpeed > 15) {
        newAlerts.push({
          type: 'storm',
          severity: 'medium',
          message: `Vents forts: ${data.windSpeed.toFixed(1)} km/h`,
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
                <SelectTrigger className="w-full sm:w-64 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b">Ma Position</div>
                  <SelectItem value="auto" className="text-xs sm:text-sm">
                    📍 Ma position actuelle
                  </SelectItem>
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Afrique de l'Ouest</div>
                  {zones.filter(z => z.country === 'Togo').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇹🇬 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Ghana').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇬🇭 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Bénin').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇧🇯 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Côte d\'Ivoire').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇨🇮 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Mali').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇲🇱 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Burkina Faso').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇧🇫 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Niger').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇳🇪 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Sénégal').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇸🇳 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => z.country === 'Guinée').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      🇬🇳 {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  {zones.filter(z => ['Libéria', 'Sierra Leone'].includes(z.country)).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Libéria' ? '🇱🇷' : '🇸🇱'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Afrique Centrale</div>
                  {zones.filter(z => ['Cameroun', 'Gabon', 'Congo', 'RD Congo', 'R. Centrafricaine', 'Tchad'].includes(z.country)).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Cameroun' ? '🇨🇲' :
                       zone.country === 'Gabon' ? '🇬🇦' :
                       zone.country === 'Congo' ? '🇨🇬' :
                       zone.country === 'RD Congo' ? '🇨🇩' :
                       zone.country === 'R. Centrafricaine' ? '🇨🇫' : '🇹🇩'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Afrique de l'Est</div>
                  {zones.filter(z => ['Kenya', 'Ouganda', 'Tanzanie', 'Rwanda', 'Burundi', 'Éthiopie', 'Érythrée', 'Djibouti', 'Somalie'].includes(z.country)).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Kenya' ? '🇰🇪' :
                       zone.country === 'Ouganda' ? '🇺🇬' :
                       zone.country === 'Tanzanie' ? '🇹🇿' :
                       zone.country === 'Rwanda' ? '🇷🇼' :
                       zone.country === 'Burundi' ? '🇧🇮' :
                       zone.country === 'Éthiopie' ? '🇪🇹' :
                       zone.country === 'Érythrée' ? '🇪🇷' :
                       zone.country === 'Djibouti' ? '🇩🇯' : '🇸🇴'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Afrique du Nord</div>
                  {zones.filter(z => ['Égypte', 'Libye', 'Tunisie', 'Algérie', 'Maroc'].includes(z.country)).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Égypte' ? '🇪🇬' :
                       zone.country === 'Libye' ? '🇱🇾' :
                       zone.country === 'Tunisie' ? '🇹🇳' :
                       zone.country === 'Algérie' ? '🇩🇿' : '🇲🇦'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Afrique Australe</div>
                  {zones.filter(z => ['Afrique du Sud', 'Namibie', 'Botswana', 'Zimbabwe', 'Zambie', 'Mozambique'].includes(z.country)).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Afrique du Sud' ? '🇿🇦' :
                       zone.country === 'Namibie' ? '🇳🇦' :
                       zone.country === 'Botswana' ? '🇧🇼' :
                       zone.country === 'Zimbabwe' ? '🇿🇼' :
                       zone.country === 'Zambie' ? '🇿🇲' : '🇲🇿'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Europe</div>
                  {zones.filter(z => z.continent === 'Europe').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'France' ? '🇫🇷' :
                       zone.country === 'Royaume-Uni' ? '🇬🇧' :
                       zone.country === 'Allemagne' ? '🇩🇪' :
                       zone.country === 'Espagne' ? '🇪🇸' : '🇮🇹'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Amérique du Nord</div>
                  {zones.filter(z => z.continent === 'Amérique du Nord').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'États-Unis' ? '🇺🇸' : '🇨🇦'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Asie</div>
                  {zones.filter(z => z.continent === 'Asie').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Japon' ? '🇯🇵' :
                       zone.country === 'Chine' ? '🇨🇳' :
                       zone.country === 'Inde' ? '🇮🇳' : '🇹🇭'} {zone.name}, {zone.country}
                    </SelectItem>
                  ))}
                  
                  <div className="p-2 text-xs font-semibold text-gray-500 border-b mt-2">Océanie</div>
                  {zones.filter(z => z.continent === 'Océanie').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs sm:text-sm">
                      {zone.country === 'Australie' ? '🇦🇺' : '🇳🇿'} {zone.name}, {zone.country}
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
            <span className="text-sm sm:text-base">
              Conditions actuelles - {weatherData.zone}
            </span>
          </CardTitle>
          <div className="mt-2 text-xs sm:text-sm text-gray-600">
            {zones.find(z => z.id === selectedZone) && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{zones.find(z => z.id === selectedZone)?.coordinates}</span>
                </div>
                {zones.find(z => z.id === selectedZone)?.country !== 'Auto' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📍</span>
                    <span>
                      {zones.find(z => z.id === selectedZone)?.name}, {zones.find(z => z.id === selectedZone)?.country} 
                      ({zones.find(z => z.id === selectedZone)?.continent})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
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
              const zoneData = getWeatherForZone(zone.id);
              const isHighRain = zoneData && zoneData.precipitation > 15;
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
                    {zoneData ? zoneData.precipitation : 0}mm
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
