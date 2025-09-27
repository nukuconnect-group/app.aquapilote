
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Fish, BarChart3, Users, Shield } from 'lucide-react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';
import SplashScreen from './SplashScreen';
import { useSettings } from '@/contexts/SettingsContext';

interface OnboardingProps {
  onComplete: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onLogin, onRegister }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const { t } = useSettings();

  const slides = [
    {
      icon: Fish,
      title: t('professional_aquaculture_management') || "Gestion Aquacole Professionnelle",
      description: t('optimize_aquaculture_production') || "Optimisez votre production aquacole avec des outils de gestion complets pour vos bassins, cheptel et cycles de production.",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: BarChart3,
      title: t('advanced_analytics') || "Analyses et Statistiques Avancées",
      description: t('track_kpi_realtime') || "Suivez vos KPI en temps réel, analysez vos performances et planifiez vos cycles de production avec précision.",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: Users,
      title: t('team_collaboration') || "Collaboration d'Équipe",
      description: t('manage_team_tasks') || "Gérez votre équipe, assignez des tâches et maintenez une communication fluide pour optimiser votre productivité.",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50"
    },
    {
      icon: Shield,
      title: t('security_reliability') || "Sécurité et Fiabilité",
      description: t('data_protection') || "Vos données sont protégées avec des sauvegardes automatiques et un système de sécurité de niveau professionnel.",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const CurrentIcon = slides[currentSlide].icon;

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-aqua-50 to-blue-100">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardContent className="p-0">
          <div className={`${slides[currentSlide].bgColor} p-8 sm:p-12 text-center transition-all duration-300`}>
            <div className="mb-6">
              <img 
                src={aquaPilotLogo} 
                alt="AQUA PILOT" 
                className="w-20 h-20 mx-auto mb-4"
              />
              <CurrentIcon className="w-16 h-16 mx-auto text-aqua-600" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {slides[currentSlide].description}
            </p>

            {/* Indicateurs de progression */}
            <div className="flex justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-aqua-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('previous') || 'Précédent'}
              </Button>

              <span className="text-sm text-gray-500">
                {currentSlide + 1} / {slides.length}
              </span>

              <Button
                variant="ghost"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2"
              >
                {t('next') || 'Suivant'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Boutons d'action finaux */}
            {currentSlide === slides.length - 1 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={onRegister}
                    className="bg-gradient-aqua text-white px-8 py-3 text-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {t('create_account') || 'Créer un compte'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onLogin}
                    className="px-8 py-3 text-lg font-semibold border-aqua-600 text-aqua-700 hover:bg-aqua-50"
                  >
                    {t('login') || 'Se connecter'}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={onComplete}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('skip_intro') || 'Passer l\'introduction'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
