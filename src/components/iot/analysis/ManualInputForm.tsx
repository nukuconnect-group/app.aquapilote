import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Thermometer, Droplets, FlaskConical, Wind, TestTube } from 'lucide-react';

interface ManualInputFormProps {
  data: {
    temperature: number;
    oxygene_dissous: number;
    ph: number;
    ammonium: number;
    nitrite: number;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ManualInputForm: React.FC<ManualInputFormProps> = ({
  data,
  onChange,
  onSubmit,
  isLoading
}) => {
  const fields = [
    { 
      id: 'temperature', 
      label: 'Température', 
      unit: '°C', 
      icon: Thermometer,
      placeholder: 'Ex: 25.5',
      step: '0.1',
      hint: 'Optimal: 22-28°C'
    },
    { 
      id: 'oxygene_dissous', 
      label: 'Oxygène dissous', 
      unit: 'mg/L', 
      icon: Wind,
      placeholder: 'Ex: 7.5',
      step: '0.1',
      hint: 'Optimal: 5-8 mg/L'
    },
    { 
      id: 'ph', 
      label: 'pH', 
      unit: '', 
      icon: FlaskConical,
      placeholder: 'Ex: 7.2',
      step: '0.1',
      hint: 'Optimal: 6.8-8.2'
    },
    { 
      id: 'ammonium', 
      label: 'Ammoniaque (NH₃/NH₄⁺)', 
      unit: 'mg/L', 
      icon: Droplets,
      placeholder: 'Ex: 0.02',
      step: '0.01',
      hint: 'Optimal: <0.02 mg/L'
    },
    { 
      id: 'nitrite', 
      label: 'Nitrite (NO₂⁻)', 
      unit: 'mg/L', 
      icon: TestTube,
      placeholder: 'Ex: 0.1',
      step: '0.01',
      hint: 'Optimal: <0.1 mg/L'
    },
  ];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Saisie manuelle des paramètres</CardTitle>
        <p className="text-sm text-muted-foreground">
          Entrez les valeurs mesurées pour obtenir une analyse personnalisée
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(({ id, label, unit, icon: Icon, placeholder, step, hint }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
                <Icon className="w-4 h-4 text-muted-foreground" />
                {label}
                {unit && <span className="text-xs text-muted-foreground">({unit})</span>}
              </Label>
              <div className="relative">
                <Input
                  id={id}
                  type="number"
                  step={step}
                  value={data[id as keyof typeof data]}
                  onChange={(e) => onChange(id, e.target.value)}
                  placeholder={placeholder}
                  className="pr-12"
                />
                {unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>

        <Button 
          onClick={onSubmit} 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 text-base"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyse IA en cours...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Lancer l'analyse IA approfondie
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
