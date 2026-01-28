import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Building, Users, Fish, Loader2, UserPlus, ChevronLeft, ChevronRight, Waves } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/clientConfig';
import aquacultureCagesDesktop from '@/assets/aquaculture-cages-desktop.jpg';
import fishColumnsMobile from '@/assets/fish-columns-mobile.jpg';

interface EnhancedRegistrationProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  selectedPlan?: string | null;
}
// Liste des pays avec codes, préfixes téléphoniques et drapeaux
const countryOptions = [
  { code: 'TG', name: 'Togo', phonePrefix: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', phonePrefix: '+229', flag: '🇧🇯' },
  { code: 'CI', name: 'Côte d\'Ivoire', phonePrefix: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', phonePrefix: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', phonePrefix: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', phonePrefix: '+226', flag: '🇧🇫' },
  { code: 'NE', name: 'Niger', phonePrefix: '+227', flag: '🇳🇪' },
  { code: 'GN', name: 'Guinée', phonePrefix: '+224', flag: '🇬🇳' },
  { code: 'CM', name: 'Cameroun', phonePrefix: '+237', flag: '🇨🇲' },
  { code: 'GA', name: 'Gabon', phonePrefix: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo', phonePrefix: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'RD Congo', phonePrefix: '+243', flag: '🇨🇩' },
  { code: 'TD', name: 'Tchad', phonePrefix: '+235', flag: '🇹🇩' },
  { code: 'CF', name: 'Centrafrique', phonePrefix: '+236', flag: '🇨🇫' },
  { code: 'MG', name: 'Madagascar', phonePrefix: '+261', flag: '🇲🇬' },
  { code: 'MU', name: 'Maurice', phonePrefix: '+230', flag: '🇲🇺' },
  { code: 'MA', name: 'Maroc', phonePrefix: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', phonePrefix: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', phonePrefix: '+216', flag: '🇹🇳' },
  { code: 'EG', name: 'Égypte', phonePrefix: '+20', flag: '🇪🇬' },
  { code: 'FR', name: 'France', phonePrefix: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', phonePrefix: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', phonePrefix: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', phonePrefix: '+1', flag: '🇨🇦' },
  { code: 'OTHER', name: 'Autre pays', phonePrefix: '', flag: '🌍' }
];

// Fonction pour obtenir le préfixe téléphonique selon le code pays
const getPhonePrefix = (countryCode: string): string => {
  const country = countryOptions.find(c => c.code === countryCode);
  return country?.phonePrefix || '';
};

// Fonction pour obtenir le drapeau selon le code pays
const getCountryFlag = (countryCode: string): string => {
  const country = countryOptions.find(c => c.code === countryCode);
  return country?.flag || '🌍';
};

// Fonction pour obtenir les infos complètes du pays
const getCountryInfo = (countryCode: string) => {
  return countryOptions.find(c => c.code === countryCode);
};

interface FormData {
  // Étape 1: Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Étape 2: Informations entreprise
  companyName: string;
  sector: string;
  country: string;
  countryCode: string;
  location: string;
  phone: string;
  employeeCount: string;

  // Étape 3: Unités de production (choix multiples)
  productionUnits: string[];

  // Informations supplémentaires
  hasProcessing: boolean;
  hasMarketing: boolean;
  hasAlgaeCulture: boolean;
  otherActivities: string;
}
const EnhancedRegistration: React.FC<EnhancedRegistrationProps> = ({
  onClose,
  onSwitchToLogin,
  selectedPlan = null
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    sector: '',
    country: '',
    countryCode: '',
    location: '',
    phone: '',
    employeeCount: '',
    productionUnits: [],
    hasProcessing: false,
    hasMarketing: false,
    hasAlgaeCulture: false,
    otherActivities: ''
  });

  // Détecter automatiquement le pays et la ville au chargement
  useEffect(() => {
    const detectLocation = async () => {
      setIsDetectingLocation(true);
      try {
        const response = await fetch('https://hhsvraqchtqqgaezhnzn.supabase.co/functions/v1/detect-country', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Location detected:', data);

          if (data.country && data.countryCode) {
            // Trouver le code pays correspondant dans notre liste
            const matchedCountry = countryOptions.find(
              c => c.code === data.countryCode || c.name.toLowerCase() === data.country.toLowerCase()
            );

            const detectedCountryCode = matchedCountry?.code || data.countryCode;
            const phonePrefix = getPhonePrefix(detectedCountryCode);
            
            setFormData(prev => ({
              ...prev,
              country: matchedCountry?.name || data.country,
              countryCode: detectedCountryCode,
              location: data.city && data.region 
                ? `${data.city}, ${data.region}` 
                : data.city || data.region || '',
              phone: phonePrefix ? `${phonePrefix} ` : prev.phone
            }));
            setLocationDetected(true);
          }
        }
      } catch (error) {
        console.error('Error detecting location:', error);
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectLocation();
  }, []);
  const {
    register,
    isLoading,
    enterDemoMode
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const { formatCurrency, t } = useSettings();

  // Handler for Google OAuth signup
  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de s'inscrire avec Google. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };

  // Handler for demo mode
  const handleDemoMode = () => {
    enterDemoMode();
    navigate('/dashboard');
  };
  const productionUnitOptions = ['Écloserie', 'Grossissement', 'Pré-grossissement', 'Nurserie', 'Reproduction', 'Quarantaine'];
  const sectorOptions = ['Pisciculture d\'eau douce', 'Aquaculture marine', 'Conchyliculture', 'Algaculture', 'Aquaponie', 'Autre'];
  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countryOptions.find(c => c.code === countryCode);
    const phonePrefix = getPhonePrefix(countryCode);
    
    setFormData(prev => {
      // Si le téléphone est vide ou ne contient qu'un ancien préfixe, mettre le nouveau préfixe
      const currentPhone = prev.phone.trim();
      const hasOnlyPrefix = countryOptions.some(c => c.phonePrefix && currentPhone === c.phonePrefix);
      const isEmpty = !currentPhone;
      
      return {
        ...prev,
        countryCode: countryCode,
        country: selectedCountry?.name || '',
        phone: (isEmpty || hasOnlyPrefix) && phonePrefix ? `${phonePrefix} ` : prev.phone
      };
    });
  };
  const handleProductionUnitChange = (unit: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        productionUnits: [...prev.productionUnits, unit]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productionUnits: prev.productionUnits.filter(u => u !== unit)
      }));
    }
  };
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 2:
        return formData.companyName && formData.sector && formData.country && formData.location && formData.phone && formData.employeeCount;
      case 3:
        return formData.productionUnits.length > 0;
      default:
        return false;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      if (canProceedToNextStep()) {
        setCurrentStep(prev => prev + 1);
      } else {
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive"
        });
      }
      return;
    }

    // Étape finale: création du compte avec validation complète
    if (canProceedToNextStep()) {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      // Validations
      if (!firstName || firstName.length < 2 || !lastName || lastName.length < 2) {
        toast({
          title: "❌ Nom invalide",
          description: "Le prénom et le nom doivent contenir au moins 2 caractères",
          variant: "destructive"
        });
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "❌ Email invalide",
          description: "Veuillez entrer une adresse email valide",
          variant: "destructive"
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: "❌ Mot de passe trop court",
          description: "Le mot de passe doit contenir au moins 8 caractères",
          variant: "destructive"
        });
        return;
      }

      try {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        
        if (fullName.trim().length < 3) {
          toast({
            title: "❌ Nom invalide",
            description: "Veuillez entrer votre prénom et nom complets",
            variant: "destructive"
          });
          return;
        }

        const result = await register(fullName, email, password, selectedPlan || 'trial');
        if (result.success) {
          toast({
            title: "✅ Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte. Bienvenue dans AQUA PILOT !"
          });
          onSwitchToLogin();
        } else {
          toast({
            title: "❌ Erreur lors de l'inscription",
            description: result.error || "Une erreur est survenue lors de l'inscription",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erreur technique",
          description: "Une erreur est survenue. Réessayez dans quelques instants.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez sélectionner au moins une unité de production",
        variant: "destructive"
      });
    }
  };
  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'trial':
        return t('trialPlan') || 'Essai Gratuit (30 jours)';
      case 'monthly':
        return `${t('monthlyPlan') || 'Plan Mensuel'} (${formatCurrency(29)}/${t('month') || 'mois'})`;
      case 'annual':
        return `${t('annualPlan') || 'Plan Annuel'} (${formatCurrency(290)}/${t('year') || 'an'})`;
      default:
        return t('noPlanSelected') || 'Plan non sélectionné';
    }
  };
  return <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!max-w-none w-screen h-screen p-0 overflow-hidden border-0 flex items-center justify-center">
        {/* Image de fond - Desktop */}
        <div className="hidden md:block fixed inset-0 w-full h-full z-0" style={{
          backgroundImage: `url(${aquacultureCagesDesktop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }} />
        
        {/* Image de fond - Mobile */}
        <div className="md:hidden fixed inset-0 w-full h-full z-0" style={{
          backgroundImage: `url(${fishColumnsMobile})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }} />
        
        {/* Overlay gradient premium */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-cyan-900/70 z-[1]" />
        
        {/* Éléments décoratifs */}
        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Conteneur principal */}
        <div className="relative z-10 w-[95%] max-w-2xl mx-auto my-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Barre décorative */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500" />
            
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    AQUAPILOTE
                  </h1>
                  <DialogTitle className="text-xl font-bold text-foreground">
                    Créer votre compte
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Étape {currentStep} sur 3
                  </DialogDescription>
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((step, i) => (
                      <React.Fragment key={step}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          currentStep >= step 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {step}
                        </div>
                        {i < 2 && <div className={`w-8 h-1 rounded ${currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-muted'}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-card-foreground">Prénom *</Label>
                    <Input id="firstName" type="text" placeholder="Votre prénom" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required className="bg-background text-foreground" />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-card-foreground">Nom *</Label>
                    <Input id="lastName" type="text" placeholder="Votre nom" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required className="bg-background text-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-card-foreground">Email *</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required className="bg-background text-foreground" />
                </div>

                <div>
                  <Label htmlFor="password" className="text-card-foreground">Mot de passe *</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required minLength={8} className="bg-background text-foreground" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Minimum 8 caractères</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-card-foreground">Confirmer le mot de passe *</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} required minLength={8} className="bg-background text-foreground" />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-sm text-destructive mt-1">Les mots de passe ne correspondent pas</p>}
                </div>
              </div>}

            {/* Étape 2: Informations entreprise */}
            {currentStep === 2 && <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                  Informations sur votre entreprise
                </h3>
                
                <div>
                  <Label htmlFor="companyName" className="text-card-foreground">Nom de l'entreprise *</Label>
                  <Input id="companyName" type="text" value={formData.companyName} onChange={e => handleInputChange('companyName', e.target.value)} required className="bg-background text-foreground" />
                </div>

                <div>
                  <Label htmlFor="sector" className="text-card-foreground">Secteur d'activité *</Label>
                  <Select value={formData.sector} onValueChange={value => handleInputChange('sector', value)}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectorOptions.map(sector => <SelectItem key={sector} value={sector.toLowerCase().replace(/\s+/g, '-')}>
                          {sector}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="country" className="text-card-foreground">Pays *</Label>
                    {isDetectingLocation && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Détection...
                      </span>
                    )}
                    {locationDetected && !isDetectingLocation && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ✓ Détecté automatiquement
                      </span>
                    )}
                  </div>
                  <Select value={formData.countryCode} onValueChange={handleCountryChange}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder={isDetectingLocation ? "Détection en cours..." : "Sélectionnez votre pays"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location" className="text-card-foreground">Ville / Région *</Label>
                    {locationDetected && formData.location && !isDetectingLocation && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ✓ Détecté automatiquement
                      </span>
                    )}
                  </div>
                  <Input 
                    id="location" 
                    type="text" 
                    placeholder={isDetectingLocation ? "Détection en cours..." : "Ville, Région"} 
                    value={formData.location} 
                    onChange={e => handleInputChange('location', e.target.value)} 
                    required 
                    className="bg-background text-foreground" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous pouvez modifier ces informations si nécessaire
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-card-foreground">Téléphone *</Label>
                  <div className="flex gap-2">
                    {/* Sélecteur de préfixe avec drapeau */}
                    <Select 
                      value={formData.countryCode} 
                      onValueChange={(code) => {
                        const country = getCountryInfo(code);
                        if (country) {
                          setFormData(prev => ({
                            ...prev,
                            countryCode: code,
                            country: country.name,
                            phone: country.phonePrefix ? `${country.phonePrefix} ` : ''
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-[120px] bg-background text-foreground shrink-0">
                        <SelectValue>
                          {formData.countryCode ? (
                            <span className="flex items-center gap-1">
                              <span className="text-lg">{getCountryFlag(formData.countryCode)}</span>
                              <span className="text-sm">{getPhonePrefix(formData.countryCode)}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">🌍 +XXX</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] bg-background border z-50">
                        {countryOptions.filter(c => c.phonePrefix).map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{country.flag}</span>
                              <span className="text-sm font-medium">{country.phonePrefix}</span>
                              <span className="text-xs text-muted-foreground">{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Champ de saisie du numéro */}
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="XX XX XX XX" 
                      value={formData.phone.replace(getPhonePrefix(formData.countryCode), '').trim()} 
                      onChange={e => {
                        const prefix = getPhonePrefix(formData.countryCode);
                        const number = e.target.value.replace(/[^\d\s]/g, '');
                        handleInputChange('phone', prefix ? `${prefix} ${number}` : number);
                      }} 
                      required 
                      className="bg-background text-foreground flex-1" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sélectionnez votre pays pour le préfixe téléphonique
                  </p>
                </div>

                <div>
                  <Label htmlFor="employeeCount" className="text-card-foreground">Nombre d'employés *</Label>
                  <Select value={formData.employeeCount} onValueChange={value => handleInputChange('employeeCount', value)}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Nombre d'employés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 employé</SelectItem>
                      <SelectItem value="2-5">2-5 employés</SelectItem>
                      <SelectItem value="6-10">6-10 employés</SelectItem>
                      <SelectItem value="11-25">11-25 employés</SelectItem>
                      <SelectItem value="26-50">26-50 employés</SelectItem>
                      <SelectItem value="50+">Plus de 50 employés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>}

            {/* Étape 3: Unités de production */}
            {currentStep === 3 && <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                  Unités de production et activités
                </h3>
                
                <div>
                  <Label className="text-base font-medium text-card-foreground">Types d'unités de production * (plusieurs choix possibles)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {productionUnitOptions.map(unit => <div key={unit} className="flex items-center space-x-2">
                        <Checkbox id={unit} checked={formData.productionUnits.includes(unit)} onCheckedChange={checked => handleProductionUnitChange(unit, checked === true)} />
                        <Label htmlFor={unit} className="text-sm cursor-pointer text-card-foreground">
                          {unit}
                        </Label>
                      </div>)}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium text-card-foreground">Activités complémentaires</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="processing" checked={formData.hasProcessing} onCheckedChange={checked => handleInputChange('hasProcessing', checked === true)} />
                    <Label htmlFor="processing" className="cursor-pointer text-card-foreground">
                      Transformation des produits
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" checked={formData.hasMarketing} onCheckedChange={checked => handleInputChange('hasMarketing', checked === true)} />
                    <Label htmlFor="marketing" className="cursor-pointer text-card-foreground">
                      Commercialisation directe
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="algae" checked={formData.hasAlgaeCulture} onCheckedChange={checked => handleInputChange('hasAlgaeCulture', checked === true)} />
                    <Label htmlFor="algae" className="cursor-pointer text-card-foreground">
                      Culture d'algues
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherActivities" className="text-card-foreground">Autres activités</Label>
                  <Textarea id="otherActivities" placeholder="Décrivez vos autres activités..." value={formData.otherActivities} onChange={e => handleInputChange('otherActivities', e.target.value)} rows={3} className="bg-background text-foreground" />
                </div>
              </div>}

          {/* Boutons de navigation */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>}

            <div className="flex-1" />

            {currentStep < 3 ? <Button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceedToNextStep()} className="bg-gradient-aqua text-primary-foreground">
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button> : <Button type="submit" disabled={isLoading || !canProceedToNextStep()} className="bg-gradient-aqua text-primary-foreground">
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </> : <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </>}
              </Button>}
          </div>

          {/* Séparateur */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-white dark:bg-slate-900 text-muted-foreground">Ou</span>
            </div>
          </div>

          {/* Bouton Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-muted-foreground/20 hover:bg-muted/50 transition-all"
            onClick={handleGoogleSignUp}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            S'inscrire avec Google
          </Button>

          {/* Bouton démo */}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-11 text-muted-foreground hover:text-foreground transition-all"
            onClick={handleDemoMode}
          >
            <Fish className="w-4 h-4 mr-2" />
            Voir la démonstration
          </Button>

          <div className="text-center pt-4 border-t border-muted-foreground/10">
            <button type="button" onClick={onSwitchToLogin} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
              Déjà un compte ? Se connecter
            </button>
          </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EnhancedRegistration;