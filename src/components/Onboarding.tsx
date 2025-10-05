
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Fish, BarChart3, Users, Shield } from 'lucide-react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-optimized.webp';
import featureManagementImg from '@/assets/feature-management.jpg';
import featureAnalyticsImg from '@/assets/feature-analytics.jpg';
import featureTeamImg from '@/assets/feature-team.jpg';
import featureSecurityImg from '@/assets/feature-security.jpg';
import iotBackground from '@/assets/iot-background.png';
import PrivacyPolicy from './PrivacyPolicy';
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
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { t } = useSettings();

  const slides = [
    {
      icon: Fish,
      title: "Gestion Aquacole Professionnelle",
      description: "Optimisez votre production aquacole avec des outils de gestion complets pour vos bassins, cheptel et cycles de production.",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      image: featureManagementImg
    },
    {
      icon: BarChart3,
      title: "Analyses et Statistiques Avancées",
      description: "Suivez vos indicateurs en temps réel, analysez vos performances et planifiez vos cycles de production avec précision.",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      image: featureAnalyticsImg
    },
    {
      icon: Users,
      title: "Collaboration d'Équipe",
      description: "Gérez votre équipe, assignez des tâches et maintenez une communication fluide pour optimiser votre productivité.",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      image: featureTeamImg
    },
    {
      icon: Shield,
      title: "Sécurité et Fiabilité",
      description: "Vos données sont protégées avec des sauvegardes automatiques et un système de sécurité de niveau professionnel.",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      image: featureSecurityImg
    },
    {
      icon: Fish,
      title: "IoT et Monitoring Intelligent",
      description: "Connectez vos équipements et surveillez vos bassins en temps réel avec des capteurs IoT. Automatisez vos opérations et recevez des alertes instantanées.",
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      image: iotBackground
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
    return <SplashScreen onComplete={() => {
      setShowSplash(false);
      setShowPrivacy(true);
    }} />;
  }

  if (showPrivacy) {
    return <PrivacyPolicy onAccept={() => setShowPrivacy(false)} />;
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
              <CurrentIcon className="w-16 h-16 mx-auto text-aqua-600 mb-4" />
            </div>

            {/* Image AI pour la fonctionnalité */}
            <div className="mb-6">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
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
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Précédent</span>
              </Button>

              <span className="text-xs sm:text-sm text-gray-500">
                {currentSlide + 1} / {slides.length}
              </span>

              <Button
                variant="ghost"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Boutons d'action finaux */}
            {currentSlide === slides.length - 1 && (
          <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-lg mx-auto px-4">
              <Button
                onClick={() => {
                  onComplete();
                  onRegister();
                }}
                className="bg-gradient-aqua text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                Créer un compte
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onComplete();
                  onLogin();
                }}
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold border-aqua-600 text-aqua-700 hover:bg-aqua-50 w-full sm:w-auto"
              >
                J'ai déjà un compte
              </Button>
            </div>
          </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
