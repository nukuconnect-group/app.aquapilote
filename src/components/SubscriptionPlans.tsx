
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  onSkip: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, onSkip }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans = [
    {
      id: 'trial',
      name: 'Essai Gratuit',
      price: '0€',
      duration: '30 jours',
      description: 'Découvrez toutes les fonctionnalités',
      icon: Zap,
      color: 'border-green-500 bg-green-50',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      features: [
        'Accès complet 30 jours',
        'Jusqu\'à 5 bassins',
        'Gestion du cheptel',
        'Rapports basiques',
        'Support par email'
      ],
      recommended: true
    },
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '29€',
      duration: 'par mois',
      description: 'Flexibilité maximale',
      icon: Star,
      color: 'border-blue-500 bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Bassins illimités',
        'Tous les modules',
        'Rapports avancés',
        'Support prioritaire',
        'Sauvegardes automatiques'
      ]
    },
    {
      id: 'annual',
      name: 'Annuel',
      price: '290€',
      duration: 'par an',
      description: 'Économisez 17%',
      icon: Crown,
      color: 'border-purple-500 bg-purple-50',
      buttonColor: 'bg-purple-600 hover:purple-700',
      features: [
        'Tout du plan mensuel',
        '2 mois gratuits',
        'Formation personnalisée',
        'Support téléphonique',
        'Consultations expert'
      ],
      savings: '-17%'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-aqua-50 to-blue-100">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sélectionnez l'offre qui correspond le mieux à votre exploitation aquacole
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  plan.color
                } ${isSelected ? 'ring-2 ring-aqua-500 scale-105' : ''} ${
                  plan.recommended ? 'border-2' : ''
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Recommandé
                    </span>
                  </div>
                )}
                
                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-white rounded-full w-fit">
                    <IconComponent className="w-8 h-8 text-aqua-600" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.duration}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.buttonColor} text-white`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isSelected ? 'Plan sélectionné' : 'Choisir ce plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Choisir plus tard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
