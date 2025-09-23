
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SensorReading {
  id: string;
  sensorType: 'oxygen' | 'ph' | 'temperature' | 'turbidity' | 'mortality';
  value: number;
  unit: string;
  timestamp: string;
  basinId: string;
  unitId: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface Basin {
  id: string;
  name: string;
  unitId: string;
  sensors: string[];
  thresholds: {
    oxygen: { min: number; max: number };
    ph: { min: number; max: number };
    temperature: { min: number; max: number };
    turbidity: { max: number };
    mortality: { max: number };
  };
}

export interface AlertThreshold {
  sensorType: string;
  basinId: string;
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
}

interface IoTContextType {
  sensorReadings: SensorReading[];
  basins: Basin[];
  alertThresholds: AlertThreshold[];
  realTimeData: Record<string, SensorReading[]>;
  connectToMqtt: (brokerUrl: string, topics: string[]) => void;
  updateThreshold: (basinId: string, sensorType: string, min?: number, max?: number) => void;
  getBasinReadings: (basinId: string) => SensorReading[];
  getUnitBasins: (unitId: string) => Basin[];
  addBasin: (basin: Omit<Basin, 'id'>) => void;
  getActiveAlerts: () => SensorReading[];
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
};

export const IoTProvider = ({ children }: { children: ReactNode }) => {
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [basins, setBasins] = useState<Basin[]>([
    {
      id: 'BAS001',
      name: 'Bassin Incubation A',
      unitId: 'ECLO001',
      sensors: ['oxygen', 'ph', 'temperature'],
      thresholds: {
        oxygen: { min: 6.0, max: 10.0 },
        ph: { min: 6.5, max: 8.0 },
        temperature: { min: 24, max: 28 },
        turbidity: { max: 5.0 },
        mortality: { max: 2.0 }
      }
    },
    {
      id: 'BAS002',
      name: 'Bassin Grossissement A1',
      unitId: 'GROSS001',
      sensors: ['oxygen', 'ph', 'temperature', 'turbidity'],
      thresholds: {
        oxygen: { min: 5.0, max: 9.0 },
        ph: { min: 6.8, max: 7.8 },
        temperature: { min: 22, max: 26 },
        turbidity: { max: 10.0 },
        mortality: { max: 1.5 }
      }
    }
  ]);
  
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>([]);
  const [realTimeData, setRealTimeData] = useState<Record<string, SensorReading[]>>({});

  // Simulation de données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const newReadings: SensorReading[] = [];
      
      basins.forEach(basin => {
        basin.sensors.forEach(sensorType => {
          let value = 0;
          let unit = '';
          
          switch (sensorType) {
            case 'oxygen':
              value = 5.5 + Math.random() * 3;
              unit = 'mg/L';
              break;
            case 'ph':
              value = 6.8 + Math.random() * 1.2;
              unit = '';
              break;
            case 'temperature':
              value = 24 + Math.random() * 4;
              unit = '°C';
              break;
            case 'turbidity':
              value = Math.random() * 15;
              unit = 'NTU';
              break;
            case 'mortality':
              value = Math.random() * 3;
              unit = '%';
              break;
          }

          const thresholds = basin.thresholds[sensorType as keyof typeof basin.thresholds];
          let status: 'normal' | 'warning' | 'critical' = 'normal';
          
          if (typeof thresholds === 'object' && 'min' in thresholds && 'max' in thresholds) {
            if (value < thresholds.min || value > thresholds.max) {
              status = 'critical';
            } else if (value < thresholds.min * 1.1 || value > thresholds.max * 0.9) {
              status = 'warning';
            }
          } else if (typeof thresholds === 'object' && 'max' in thresholds) {
            if (value > thresholds.max) {
              status = 'critical';
            } else if (value > thresholds.max * 0.8) {
              status = 'warning';
            }
          }

          const reading: SensorReading = {
            id: `${basin.id}-${sensorType}-${Date.now()}`,
            sensorType: sensorType as SensorReading['sensorType'],
            value: Number(value.toFixed(2)),
            unit,
            timestamp: new Date().toISOString(),
            basinId: basin.id,
            unitId: basin.unitId,
            status
          };

          newReadings.push(reading);
        });
      });

      setSensorReadings(prev => [...newReadings, ...prev.slice(0, 1000)]);
      
      // Mettre à jour les données temps réel par bassin
      setRealTimeData(prev => {
        const updated = { ...prev };
        newReadings.forEach(reading => {
          if (!updated[reading.basinId]) {
            updated[reading.basinId] = [];
          }
          updated[reading.basinId] = [reading, ...updated[reading.basinId].slice(0, 50)];
        });
        return updated;
      });
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, [basins]);

  const connectToMqtt = (brokerUrl: string, topics: string[]) => {
    console.log(`Connexion MQTT à ${brokerUrl} pour les topics:`, topics);
    // Ici vous intégreriez une vraie connexion MQTT
  };

  const updateThreshold = (basinId: string, sensorType: string, min?: number, max?: number) => {
    setBasins(prev => prev.map(basin => {
      if (basin.id === basinId) {
        const newThresholds = { ...basin.thresholds };
        if (sensorType in newThresholds) {
          const threshold = newThresholds[sensorType as keyof typeof newThresholds];
          if (typeof threshold === 'object' && 'min' in threshold && 'max' in threshold) {
            (threshold as any).min = min ?? threshold.min;
            (threshold as any).max = max ?? threshold.max;
          } else if (typeof threshold === 'object' && 'max' in threshold) {
            (threshold as any).max = max ?? threshold.max;
          }
        }
        return { ...basin, thresholds: newThresholds };
      }
      return basin;
    }));
  };

  const getBasinReadings = (basinId: string) => {
    return sensorReadings.filter(reading => reading.basinId === basinId);
  };

  const getUnitBasins = (unitId: string) => {
    return basins.filter(basin => basin.unitId === unitId);
  };

  const addBasin = (basinData: Omit<Basin, 'id'>) => {
    const newBasin: Basin = {
      ...basinData,
      id: `BAS${Date.now()}`
    };
    setBasins(prev => [...prev, newBasin]);
  };

  const getActiveAlerts = () => {
    return sensorReadings.filter(reading => 
      reading.status === 'critical' || reading.status === 'warning'
    ).slice(0, 20);
  };

  return (
    <IoTContext.Provider value={{
      sensorReadings,
      basins,
      alertThresholds,
      realTimeData,
      connectToMqtt,
      updateThreshold,
      getBasinReadings,
      getUnitBasins,
      addBasin,
      getActiveAlerts
    }}>
      {children}
    </IoTContext.Provider>
  );
};
