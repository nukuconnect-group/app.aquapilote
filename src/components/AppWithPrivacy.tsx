import * as React from 'react';
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

// Interface pour le state
interface AppState {
  showSplash: boolean;
  showOnboarding: boolean;
  showPrivacyPolicy: boolean;
  showMainApp: boolean;
  isInitialized: boolean;
}

// Classe Component pour éviter les problèmes de dispatcher
class AppWithPrivacy extends React.Component<{}, AppState> {
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
    // Initialisation après le mount
    setTimeout(() => {
      this.setState({ isInitialized: true });
      
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
    }, 100);
  }

  handleSplashComplete = () => {
    this.setState({ showSplash: false });
    
    const hasAcceptedPrivacy = localStorage.getItem('privacy-policy-accepted') === 'true';
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';

    if (!hasAcceptedPrivacy) {
      this.setState({ showPrivacyPolicy: true });
    } else if (!hasSeenOnboarding) {
      this.setState({ showOnboarding: true });
    } else {
      this.setState({ showMainApp: true });
    }
  };

  handlePrivacyAccept = () => {
    localStorage.setItem('privacy-policy-accepted', 'true');
    this.setState({ showPrivacyPolicy: false });
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';
    
    if (!hasSeenOnboarding) {
      this.setState({ showOnboarding: true });
    } else {
      this.setState({ showMainApp: true });
    }
  };

  handlePrivacyDecline = () => {
    // Rediriger vers une page d'information ou fermer l'application
    window.location.href = 'https://www.google.com';
  };

  handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    this.setState({ 
      showOnboarding: false,
      showMainApp: true 
    });
  };

  handleLogin = () => {
    // La connexion sera gérée par le MainLayout
    this.setState({
      showOnboarding: false,
      showMainApp: true
    });
  };

  handleRegister = () => {
    // L'inscription sera gérée par le MainLayout
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

    // Ne rien rendre tant que le composant n'est pas initialisé
    if (!isInitialized) {
      return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>;
    }

    return (
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
    );
  }
}

export default AppWithPrivacy;