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
import aquacultureCagesDesktop from '@/assets/aquaculture-cages-desktop.jpg';
import fishColumnsMobile from '@/assets/fish-columns-mobile.jpg';

interface EnhancedRegistrationProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  selectedPlan?: string | null;
}

// Country list with codes, phone prefixes, flags, and typical names
const countryOptions = [
  { code: 'TG', name: 'Togo', phonePrefix: '+228', flag: '🇹🇬', sampleFirstNames: ['Kodjo', 'Kofi', 'Ama', 'Akouvi', 'Yao', 'Essi'], sampleLastNames: ['Agbeko', 'Mensah', 'Amouzou', 'Kpodo', 'Assogba', 'Attiogbe'] },
  { code: 'BJ', name: 'Bénin', phonePrefix: '+229', flag: '🇧🇯', sampleFirstNames: ['Codjo', 'Fréjus', 'Elvire', 'Grâce', 'Boris', 'Sènami'], sampleLastNames: ['Houngbedji', 'Ahouandjinou', 'Dossou', 'Agossou', 'Houénou', 'Gnimavo'] },
  { code: 'CI', name: 'Côte d\'Ivoire', phonePrefix: '+225', flag: '🇨🇮', sampleFirstNames: ['Kouadio', 'Yao', 'Aya', 'Aminata', 'Seydou', 'Fatou'], sampleLastNames: ['Koné', 'Ouattara', 'Touré', 'Koffi', 'Bamba', 'Coulibaly'] },
  { code: 'SN', name: 'Sénégal', phonePrefix: '+221', flag: '🇸🇳', sampleFirstNames: ['Moussa', 'Fatou', 'Ibrahima', 'Aminata', 'Ousmane', 'Aïssatou'], sampleLastNames: ['Diop', 'Ndiaye', 'Fall', 'Sow', 'Ba', 'Diallo'] },
  { code: 'ML', name: 'Mali', phonePrefix: '+223', flag: '🇲🇱', sampleFirstNames: ['Amadou', 'Fatoumata', 'Moussa', 'Mariam', 'Oumar', 'Kadiatou'], sampleLastNames: ['Traoré', 'Coulibaly', 'Diarra', 'Keita', 'Sissoko', 'Sangaré'] },
  { code: 'BF', name: 'Burkina Faso', phonePrefix: '+226', flag: '🇧🇫', sampleFirstNames: ['Adama', 'Fatimata', 'Issouf', 'Mariam', 'Hamidou', 'Salamata'], sampleLastNames: ['Ouédraogo', 'Sawadogo', 'Compaoré', 'Kaboré', 'Zoungrana', 'Tall'] },
  { code: 'NE', name: 'Niger', phonePrefix: '+227', flag: '🇳🇪', sampleFirstNames: ['Abdou', 'Halima', 'Hamidou', 'Mariama', 'Souley', 'Fati'], sampleLastNames: ['Abdou', 'Mahamane', 'Adamou', 'Ibrahim', 'Moussa', 'Boubacar'] },
  { code: 'GN', name: 'Guinée', phonePrefix: '+224', flag: '🇬🇳', sampleFirstNames: ['Mamadou', 'Fatoumata', 'Alpha', 'Mariama', 'Ibrahima', 'Kadiatou'], sampleLastNames: ['Diallo', 'Barry', 'Bah', 'Camara', 'Soumah', 'Sylla'] },
  { code: 'CM', name: 'Cameroun', phonePrefix: '+237', flag: '🇨🇲', sampleFirstNames: ['Jean', 'Marie', 'Paul', 'Cécile', 'Emmanuel', 'Nadège'], sampleLastNames: ['Nkomo', 'Mbarga', 'Fotso', 'Tchoumi', 'Ngono', 'Kamga'] },
  { code: 'GA', name: 'Gabon', phonePrefix: '+241', flag: '🇬🇦', sampleFirstNames: ['Jean-Pierre', 'Marie-Claire', 'Patrick', 'Sylvie', 'Christian', 'Nadine'], sampleLastNames: ['Moussavou', 'Ndong', 'Obiang', 'Nze', 'Mba', 'Ella'] },
  { code: 'CG', name: 'Congo', phonePrefix: '+242', flag: '🇨🇬', sampleFirstNames: ['Serge', 'Nadine', 'Cédric', 'Grâce', 'Parfait', 'Charlène'], sampleLastNames: ['Mbemba', 'Mouanda', 'Ngoie', 'Mabiala', 'Malonga', 'Banzouzi'] },
  { code: 'CD', name: 'RD Congo', phonePrefix: '+243', flag: '🇨🇩', sampleFirstNames: ['Patrick', 'Grâce', 'Christian', 'Nadine', 'Jonathan', 'Esther'], sampleLastNames: ['Kabongo', 'Mbuyi', 'Tshimanga', 'Kalala', 'Mutombo', 'Kasongo'] },
  { code: 'TD', name: 'Tchad', phonePrefix: '+235', flag: '🇹🇩', sampleFirstNames: ['Moussa', 'Fatimé', 'Abdoulaye', 'Hawa', 'Mahamat', 'Amina'], sampleLastNames: ['Mahamat', 'Adam', 'Hassan', 'Ali', 'Oumar', 'Djibrine'] },
  { code: 'CF', name: 'Centrafrique', phonePrefix: '+236', flag: '🇨🇫', sampleFirstNames: ['Jean', 'Marie', 'Pierre', 'Cécile', 'Paul', 'Brigitte'], sampleLastNames: ['Ngoupandé', 'Yakité', 'Ziguélé', 'Goumba', 'Bria', 'Ndoutingaï'] },
  { code: 'MG', name: 'Madagascar', phonePrefix: '+261', flag: '🇲🇬', sampleFirstNames: ['Hery', 'Nirina', 'Andry', 'Voahirana', 'Tojo', 'Mialy'], sampleLastNames: ['Rakoto', 'Andria', 'Ratsimba', 'Rasolofo', 'Raveloson', 'Randriana'] },
  { code: 'MU', name: 'Maurice', phonePrefix: '+230', flag: '🇲🇺', sampleFirstNames: ['Rajesh', 'Priya', 'Kevin', 'Marie', 'Vikram', 'Anita'], sampleLastNames: ['Doorgakant', 'Ramsaran', 'Jeetoo', 'Doobur', 'Doorgakant', 'Doorgakant'] },
  { code: 'MA', name: 'Maroc', phonePrefix: '+212', flag: '🇲🇦', sampleFirstNames: ['Mohammed', 'Fatima', 'Ahmed', 'Khadija', 'Youssef', 'Zineb'], sampleLastNames: ['Alaoui', 'Bennani', 'Tazi', 'El Fassi', 'Cherkaoui', 'Berrada'] },
  { code: 'DZ', name: 'Algérie', phonePrefix: '+213', flag: '🇩🇿', sampleFirstNames: ['Mohammed', 'Fatima', 'Ahmed', 'Amina', 'Karim', 'Nadia'], sampleLastNames: ['Boudiaf', 'Benali', 'Khelifi', 'Hamidi', 'Djamel', 'Larbi'] },
  { code: 'TN', name: 'Tunisie', phonePrefix: '+216', flag: '🇹🇳', sampleFirstNames: ['Mohamed', 'Fatma', 'Ahmed', 'Amira', 'Youssef', 'Ines'], sampleLastNames: ['Ben Ali', 'Trabelsi', 'Bouazizi', 'Jebali', 'Mabrouk', 'Gharbi'] },
  { code: 'EG', name: 'Égypte', phonePrefix: '+20', flag: '🇪🇬', sampleFirstNames: ['Mohamed', 'Fatma', 'Ahmed', 'Nour', 'Omar', 'Sara'], sampleLastNames: ['Hassan', 'Ibrahim', 'Ali', 'Mohamed', 'Mahmoud', 'Abdel'] },
  { code: 'FR', name: 'France', phonePrefix: '+33', flag: '🇫🇷', sampleFirstNames: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Camille'], sampleLastNames: ['Martin', 'Durand', 'Bernard', 'Dubois', 'Moreau', 'Laurent'] },
  { code: 'BE', name: 'Belgique', phonePrefix: '+32', flag: '🇧🇪', sampleFirstNames: ['Jean', 'Marie', 'Luc', 'Anne', 'Thomas', 'Emma'], sampleLastNames: ['Janssens', 'Peeters', 'Maes', 'Jacobs', 'Mertens', 'Willems'] },
  { code: 'CH', name: 'Suisse', phonePrefix: '+41', flag: '🇨🇭', sampleFirstNames: ['Marc', 'Marie', 'Pierre', 'Anna', 'Thomas', 'Laura'], sampleLastNames: ['Müller', 'Favre', 'Rochat', 'Bianchi', 'Brunner', 'Keller'] },
  { code: 'CA', name: 'Canada', phonePrefix: '+1', flag: '🇨🇦', sampleFirstNames: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Marc', 'Isabelle'], sampleLastNames: ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier'] },
  { code: 'OTHER', name: 'Autre pays', phonePrefix: '', flag: '🌍', sampleFirstNames: [], sampleLastNames: [] }
];

const getPhonePrefix = (countryCode: string): string => {
  const country = countryOptions.find(c => c.code === countryCode);
  return country?.phonePrefix || '';
};

const getCountryFlag = (countryCode: string): string => {
  const country = countryOptions.find(c => c.code === countryCode);
  return country?.flag || '🌍';
};

const getCountryInfo = (countryCode: string) => {
  return countryOptions.find(c => c.code === countryCode);
};

const getNameSuggestions = (countryCode: string) => {
  const country = countryOptions.find(c => c.code === countryCode);
  if (!country) return { firstNames: [], lastNames: [] };
  return { firstNames: country.sampleFirstNames || [], lastNames: country.sampleLastNames || [] };
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  sector: string;
  country: string;
  countryCode: string;
  location: string;
  phone: string;
  employeeCount: string;
  productionUnits: string[];
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

  // Detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      setIsDetectingLocation(true);
      try {
        const response = await fetch('https://hhsvraqchtqqgaezhnzn.supabase.co/functions/v1/detect-country', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.country && data.countryCode) {
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

  const { register, isLoading, enterDemoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatCurrency, t } = useSettings();

  const handleDemoMode = () => {
    enterDemoMode();
    navigate('/dashboard');
  };

  const productionUnitOptions = [
    t('hatchery') || 'Écloserie', 
    t('grow_out') || 'Grossissement', 
    t('pre_grow_out') || 'Pré-grossissement', 
    t('nursery') || 'Nurserie', 
    t('reproduction') || 'Reproduction', 
    t('preventive_quarantine') || 'Quarantaine'
  ];
  
  const sectorOptions = [
    t('freshwater_aquaculture') || 'Pisciculture d\'eau douce', 
    t('marine_aquaculture') || 'Aquaculture marine', 
    t('shellfish') || 'Conchyliculture', 
    t('algaculture') || 'Algaculture', 
    t('aquaponics') || 'Aquaponie', 
    t('other') || 'Autre'
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countryOptions.find(c => c.code === countryCode);
    const phonePrefix = getPhonePrefix(countryCode);
    
    setFormData(prev => {
      const currentPhone = prev.phone.trim();
      const hasOnlyPrefix = countryOptions.some(c => c.phonePrefix && currentPhone === c.phonePrefix);
      const isEmpty = !currentPhone;
      
      return {
        ...prev,
        countryCode,
        country: selectedCountry?.name || '',
        phone: (isEmpty || hasOnlyPrefix) && phonePrefix ? `${phonePrefix} ` : prev.phone
      };
    });
  };

  const handleProductionUnitChange = (unit: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, productionUnits: [...prev.productionUnits, unit] }));
    } else {
      setFormData(prev => ({ ...prev, productionUnits: prev.productionUnits.filter(u => u !== unit) }));
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 2: return formData.companyName && formData.sector && formData.country && formData.location && formData.phone && formData.employeeCount;
      case 3: return formData.productionUnits.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      if (canProceedToNextStep()) {
        setCurrentStep(prev => prev + 1);
      } else {
        toast({ title: t('warning'), description: t('fill_required_fields') || 'Veuillez remplir tous les champs requis', variant: "destructive" });
      }
      return;
    }

    if (canProceedToNextStep()) {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!firstName || firstName.length < 2 || !lastName || lastName.length < 2) {
        toast({ title: `❌ ${t('error')}`, description: t('name_too_short'), variant: "destructive" });
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: `❌ ${t('invalid_email')}`, description: t('invalid_email'), variant: "destructive" });
        return;
      }
      if (password.length < 8) {
        toast({ title: `❌ ${t('error')}`, description: t('password_too_short'), variant: "destructive" });
        return;
      }

      try {
        const fullName = `${firstName} ${lastName}`;
        const result = await register(fullName, email, password, selectedPlan || 'trial');
        if (result.success) {
          toast({
            title: '✅ Compte créé avec succès',
            description: 'Votre compte a été créé et est en attente d\'activation par un administrateur. Vous recevrez une notification dès qu\'il sera activé.',
            duration: 10000,
          });
          onSwitchToLogin();
        } else {
          toast({ title: `❌ ${t('registration_error')}`, description: result.error || t('registration_error'), variant: "destructive" });
        }
      } catch (error) {
        toast({ title: `❌ ${t('error')}`, description: t('technical_error') || 'Une erreur est survenue.', variant: "destructive" });
      }
    } else {
      toast({ title: t('warning'), description: t('select_production_unit') || 'Veuillez sélectionner au moins une unité de production', variant: "destructive" });
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'trial': return t('trial_plan') || 'Essai Gratuit (30 jours)';
      case 'monthly': return `${t('monthly_plan') || 'Plan Mensuel'} (${formatCurrency(29)}/${t('month') || 'mois'})`;
      case 'annual': return `${t('annual_plan') || 'Plan Annuel'} (${formatCurrency(290)}/${t('year') || 'an'})`;
      default: return t('no_plan_selected') || 'Plan non sélectionné';
    }
  };

  const nameSuggestions = getNameSuggestions(formData.countryCode);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent hideClose className="!max-w-none w-screen h-screen p-0 overflow-hidden border-0 flex items-center justify-center">
        {/* Background - Desktop */}
        <div className="hidden md:block fixed inset-0 w-full h-full z-0" style={{
          backgroundImage: `url(${aquacultureCagesDesktop})`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.7)',
        }} />
        {/* Background - Mobile */}
        <div className="md:hidden fixed inset-0 w-full h-full z-0" style={{
          backgroundImage: `url(${fishColumnsMobile})`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.7)',
        }} />
        
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-cyan-900/70 z-[1]" />
        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 w-[95%] max-w-2xl mx-auto my-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500" />
            
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    AQUAPILOTE
                  </h1>
                  <DialogTitle className="text-xl font-bold text-foreground">
                    {t('create_account')}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    {t('step')} {currentStep} {t('of')} 3
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

                {/* Step 1: Personal info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                      {t('personal_info')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-card-foreground">{t('first_name')} *</Label>
                        <Input 
                          id="firstName" type="text" 
                          placeholder={nameSuggestions.firstNames.length > 0 
                            ? `${t('example') || 'Ex'}: ${nameSuggestions.firstNames.slice(0, 2).join(', ')}` 
                            : t('first_name')} 
                          value={formData.firstName} 
                          onChange={e => handleInputChange('firstName', e.target.value)} 
                          required className="bg-background text-foreground" 
                        />
                        {nameSuggestions.firstNames.length > 0 && !formData.firstName && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {nameSuggestions.firstNames.slice(0, 4).map(name => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => handleInputChange('firstName', name)}
                                className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName" className="text-card-foreground">{t('last_name')} *</Label>
                        <Input 
                          id="lastName" type="text" 
                          placeholder={nameSuggestions.lastNames.length > 0 
                            ? `${t('example') || 'Ex'}: ${nameSuggestions.lastNames.slice(0, 2).join(', ')}` 
                            : t('last_name')} 
                          value={formData.lastName} 
                          onChange={e => handleInputChange('lastName', e.target.value)} 
                          required className="bg-background text-foreground" 
                        />
                        {nameSuggestions.lastNames.length > 0 && !formData.lastName && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {nameSuggestions.lastNames.slice(0, 4).map(name => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => handleInputChange('lastName', name)}
                                className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-card-foreground">{t('email')} *</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required className="bg-background text-foreground" />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-card-foreground">{t('password')} *</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required minLength={8} className="bg-background text-foreground" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t('password_too_short')}</p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-card-foreground">{t('confirm_password')} *</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} required minLength={8} className="bg-background text-foreground" />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">{t('passwords_dont_match')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Company info */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                      {t('company_info')}
                    </h3>
                    
                    <div>
                      <Label htmlFor="companyName" className="text-card-foreground">{t('company_name')} *</Label>
                      <Input id="companyName" type="text" value={formData.companyName} onChange={e => handleInputChange('companyName', e.target.value)} required className="bg-background text-foreground" />
                    </div>

                    <div>
                      <Label htmlFor="sector" className="text-card-foreground">{t('sector')} *</Label>
                      <Select value={formData.sector} onValueChange={value => handleInputChange('sector', value)}>
                        <SelectTrigger className="bg-background text-foreground">
                          <SelectValue placeholder={t('select') + '...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {sectorOptions.map(sector => (
                            <SelectItem key={sector} value={sector.toLowerCase().replace(/\s+/g, '-')}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="country" className="text-card-foreground">{t('country')} *</Label>
                        {isDetectingLocation && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t('loading')}
                          </span>
                        )}
                        {locationDetected && !isDetectingLocation && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ {t('auto_detected') || 'Détecté automatiquement'}
                          </span>
                        )}
                      </div>
                      <Select value={formData.countryCode} onValueChange={handleCountryChange}>
                        <SelectTrigger className="bg-background text-foreground">
                          <SelectValue placeholder={isDetectingLocation ? t('loading') : `${t('select')}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="location" className="text-card-foreground">{t('location')} *</Label>
                        {locationDetected && formData.location && !isDetectingLocation && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ {t('auto_detected') || 'Détecté automatiquement'}
                          </span>
                        )}
                      </div>
                      <Input 
                        id="location" type="text" 
                        placeholder={isDetectingLocation ? t('loading') : t('location')} 
                        value={formData.location} 
                        onChange={e => handleInputChange('location', e.target.value)} 
                        required className="bg-background text-foreground" 
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-card-foreground">{t('phone')} *</Label>
                      <div className="flex gap-2">
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
                        
                        <Input 
                          id="phone" type="tel" placeholder="XX XX XX XX" 
                          value={formData.phone.replace(getPhonePrefix(formData.countryCode), '').trim()} 
                          onChange={e => {
                            const prefix = getPhonePrefix(formData.countryCode);
                            const number = e.target.value.replace(/[^\d\s]/g, '');
                            handleInputChange('phone', prefix ? `${prefix} ${number}` : number);
                          }} 
                          required className="bg-background text-foreground flex-1" 
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="employeeCount" className="text-card-foreground">{t('employee_count')} *</Label>
                      <Select value={formData.employeeCount} onValueChange={value => handleInputChange('employeeCount', value)}>
                        <SelectTrigger className="bg-background text-foreground">
                          <SelectValue placeholder={t('employee_count')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2-5">2-5</SelectItem>
                          <SelectItem value="6-10">6-10</SelectItem>
                          <SelectItem value="11-25">11-25</SelectItem>
                          <SelectItem value="26-50">26-50</SelectItem>
                          <SelectItem value="50+">50+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Production units */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                      {t('production_units_selection')}
                    </h3>
                    
                    <div>
                      <Label className="text-base font-medium text-card-foreground">{t('select_production_units')} *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {productionUnitOptions.map(unit => (
                          <div key={unit} className="flex items-center space-x-2">
                            <Checkbox id={unit} checked={formData.productionUnits.includes(unit)} onCheckedChange={checked => handleProductionUnitChange(unit, checked === true)} />
                            <Label htmlFor={unit} className="text-sm cursor-pointer text-card-foreground">{unit}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-card-foreground">{t('other_activities') || 'Activités complémentaires'}</Label>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="processing" checked={formData.hasProcessing} onCheckedChange={checked => handleInputChange('hasProcessing', checked === true)} />
                        <Label htmlFor="processing" className="cursor-pointer text-card-foreground">{t('processing_unit')}</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" checked={formData.hasMarketing} onCheckedChange={checked => handleInputChange('hasMarketing', checked === true)} />
                        <Label htmlFor="marketing" className="cursor-pointer text-card-foreground">{t('marketing_unit')}</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="algae" checked={formData.hasAlgaeCulture} onCheckedChange={checked => handleInputChange('hasAlgaeCulture', checked === true)} />
                        <Label htmlFor="algae" className="cursor-pointer text-card-foreground">{t('algae_culture')}</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="otherActivities" className="text-card-foreground">{t('other_activities')}</Label>
                      <Textarea id="otherActivities" placeholder={t('description') + '...'} value={formData.otherActivities} onChange={e => handleInputChange('otherActivities', e.target.value)} rows={3} className="bg-background text-foreground" />
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      {t('previous')}
                    </Button>
                  )}
                  <div className="flex-1" />
                  {currentStep < 3 ? (
                    <Button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceedToNextStep()} className="bg-gradient-aqua text-primary-foreground">
                      {t('next')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading || !canProceedToNextStep()} className="bg-gradient-aqua text-primary-foreground">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('loading')}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t('create_account')}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Demo */}
                <Button type="button" variant="ghost" className="w-full h-11 text-muted-foreground hover:text-foreground transition-all" onClick={handleDemoMode}>
                  <Fish className="w-4 h-4 mr-2" />
                  {t('try_demo')}
                </Button>

                <div className="text-center pt-4 border-t border-muted-foreground/10">
                  <button type="button" onClick={onSwitchToLogin} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                    {t('already_have_account')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedRegistration;
