import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import SplashScreen from '@/components/SplashScreen';
import Onboarding from '@/components/Onboarding';
import MainLayout from '@/components/MainLayout';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Interface pour le state
interface AppState {
  showSplash: boolean;
  showOnboarding: boolean;
  showPrivacyPolicy: boolean;
  showMainApp: boolean;
  isInitialized: boolean;
}

// Classe Component pour éviter les problèmes de dispatcher
class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      showSplash: true,
      showOnboarding: false,
      showPrivacyPolicy: false,
      showMainApp: false,
      isInitialized: false
    };
  }

  componentDidMount() {
    // Initialisation après le mount avec un petit délai pour éviter les problèmes de dispatcher
    setTimeout(() => {
      this.setState({ isInitialized: true });
      
      try {
        // Vérifier si l'utilisateur a déjà accepté la politique de confidentialité
        const hasAcceptedPrivacy = localStorage.getItem('privacy-policy-accepted') === 'true';
        const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';

        if (!hasAcceptedPrivacy) {
          this.setState({ showPrivacyPolicy: true });
        } else if (!hasSeenOnboarding) {
          this.setState({ showOnboarding: true });
        } else {
          this.setState({ showMainApp: true });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        // En cas d'erreur, aller directement à l'application principale
        this.setState({ showMainApp: true });
      }
    }, 200);
  }

  handleSplashComplete = () => {
    this.setState({ showSplash: false });
    
    try {
      const hasAcceptedPrivacy = localStorage.getItem('privacy-policy-accepted') === 'true';
      const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';

      if (!hasAcceptedPrivacy) {
        this.setState({ showPrivacyPolicy: true });
      } else if (!hasSeenOnboarding) {
        this.setState({ showOnboarding: true });
      } else {
        this.setState({ showMainApp: true });
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du splash:', error);
      this.setState({ showMainApp: true });
    }
  };

  handlePrivacyAccept = () => {
    try {
      localStorage.setItem('privacy-policy-accepted', 'true');
      this.setState({ showPrivacyPolicy: false });
      const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';
      
      if (!hasSeenOnboarding) {
        this.setState({ showOnboarding: true });
      } else {
        this.setState({ showMainApp: true });
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la politique:', error);
      this.setState({ showMainApp: true });
    }
  };

  handlePrivacyDecline = () => {
    // Rediriger vers une page d'information ou fermer l'application
    window.location.href = 'https://www.google.com';
  };

  handleOnboardingComplete = () => {
    try {
      localStorage.setItem('onboarding-completed', 'true');
      this.setState({ 
        showOnboarding: false,
        showMainApp: true 
      });
    } catch (error) {
      console.error('Erreur lors de la completion de l\'onboarding:', error);
      this.setState({ showMainApp: true });
    }
  };

  handleLogin = () => {
    this.setState({
      showOnboarding: false,
      showMainApp: true
    });
  };

  handleRegister = () => {
    this.setState({
      showOnboarding: false,
      showMainApp: true
    });
  };

  render() {
    const { 
      showSplash, 
      showPrivacyPolicy, 
      showOnboarding, 
      showMainApp, 
      isInitialized 
    } = this.state;

    // Écran de chargement initial
    if (!isInitialized) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Initialisation...</p>
          </div>
        </div>
      );
    }

    return (
      <Router>
        <SettingsProvider>
          <AuthProvider>
            <ProductionUnitsProvider>
              <IoTProvider>
                <LogsProvider>
                  <div className="min-h-screen">
                    {showSplash && (
                      <SplashScreen onComplete={this.handleSplashComplete} />
                    )}
                    
                    {showPrivacyPolicy && (
                      <PrivacyPolicy 
                        onAccept={this.handlePrivacyAccept}
                        onDecline={this.handlePrivacyDecline}
                      />
                    )}
                    
                    {showOnboarding && (
                      <Onboarding
                        onComplete={this.handleOnboardingComplete}
                        onLogin={this.handleLogin}
                        onRegister={this.handleRegister}
                      />
                    )}
                    
                    {showMainApp && <MainLayout />}
                    
                    <Toaster />
                  </div>
                </LogsProvider>
              </IoTProvider>
            </ProductionUnitsProvider>
          </AuthProvider>
        </SettingsProvider>
      </Router>
    );
  }
}

export default App;