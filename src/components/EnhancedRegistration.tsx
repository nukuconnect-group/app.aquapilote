import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Building, Users, Fish, Loader2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';
import aquacultureCagesDesktop from '@/assets/aquaculture-cages-desktop.jpg';
import fishColumnsMobile from '@/assets/fish-columns-mobile.jpg';

interface EnhancedRegistrationProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  selectedPlan?: string | null;
}

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
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    sector: '',
    location: '',
    phone: '',
    employeeCount: '',
    productionUnits: [],
    hasProcessing: false,
    hasMarketing: false,
    hasAlgaeCulture: false,
    otherActivities: ''
  });
  
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const productionUnitOptions = [
    'Écloserie',
    'Grossissement',
    'Pré-grossissement',
    'Nurserie',
    'Reproduction',
    'Quarantaine'
  ];
  
  const sectorOptions = [
    'Pisciculture d\'eau douce',
    'Aquaculture marine',
    'Conchyliculture',
    'Algaculture',
    'Aquaponie',
    'Autre'
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        return formData.firstName && formData.lastName && formData.email && 
               formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword;
      case 2:
        return formData.companyName && formData.sector && formData.location && 
               formData.phone && formData.employeeCount;
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
          variant: "destructive",
        });
      }
      return;
    }

    // Étape finale: création du compte
    if (canProceedToNextStep()) {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const success = await register(fullName, formData.email, formData.password, selectedPlan || 'trial');
      
      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Bienvenue dans AQUA PILOT !",
        });
        onClose();
      } else {
        toast({
          title: "Erreur lors de l'inscription",
          description: "Veuillez réessayer",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez sélectionner au moins une unité de production",
        variant: "destructive",
      });
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'trial': return 'Essai Gratuit (30 jours)';
      case 'monthly': return 'Plan Mensuel (29€/mois)';
      case 'annual': return 'Plan Annuel (290€/an)';
      default: return 'Plan non sélectionné';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!max-w-none w-screen h-screen p-0 overflow-hidden border-0 flex items-center justify-center">
        {/* Image de fond professionnelle - Desktop */}
        <div 
          className="hidden sm:block fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${aquacultureCagesDesktop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.85)',
            width: '100%',
            height: '100vh'
          }}
        />
        
        {/* Image de fond professionnelle - Mobile */}
        <div 
          className="sm:hidden fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${fishColumnsMobile})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.85)',
            width: '100%',
            height: '100vh'
          }}
        />
        
        {/* Overlay gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-aqua-900/40 via-ocean-600/30 to-aqua-800/40 z-[1]" />
        
        {/* Contenu centré */}
        <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-lg shadow-2xl w-[90%] max-w-2xl mx-auto my-auto overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-4 shadow-xl">
                  <img 
                    src={aquaPilotLogo} 
                    alt="AQUA PILOT" 
                    className="w-24 h-24"
                  />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Créer votre compte AQUA PILOT
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Étape {currentStep} sur 3 - Rejoignez la révolution de l'aquaculture intelligente
              </DialogDescription>
            </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Informations entreprise */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Informations sur votre entreprise
                </h3>
                
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sector">Secteur d'activité *</Label>
                  <Select 
                    value={formData.sector} 
                    onValueChange={(value) => handleInputChange('sector', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectorOptions.map((sector) => (
                        <SelectItem key={sector} value={sector.toLowerCase().replace(/\s+/g, '-')}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Ville, Région, Pays"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+228 XX XX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employeeCount">Nombre d'employés *</Label>
                  <Select 
                    value={formData.employeeCount} 
                    onValueChange={(value) => handleInputChange('employeeCount', value)}
                  >
                    <SelectTrigger>
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
              </div>
            )}

            {/* Étape 3: Unités de production */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Unités de production et activités
                </h3>
                
                <div>
                  <Label className="text-base font-medium">Types d'unités de production * (plusieurs choix possibles)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {productionUnitOptions.map((unit) => (
                      <div key={unit} className="flex items-center space-x-2">
                        <Checkbox
                          id={unit}
                          checked={formData.productionUnits.includes(unit)}
                          onCheckedChange={(checked) => handleProductionUnitChange(unit, checked === true)}
                        />
                        <Label htmlFor={unit} className="text-sm cursor-pointer">
                          {unit}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Activités complémentaires</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="processing"
                      checked={formData.hasProcessing}
                      onCheckedChange={(checked) => handleInputChange('hasProcessing', checked === true)}
                    />
                    <Label htmlFor="processing" className="cursor-pointer">
                      Transformation des produits
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.hasMarketing}
                      onCheckedChange={(checked) => handleInputChange('hasMarketing', checked === true)}
                    />
                    <Label htmlFor="marketing" className="cursor-pointer">
                      Commercialisation directe
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="algae"
                      checked={formData.hasAlgaeCulture}
                      onCheckedChange={(checked) => handleInputChange('hasAlgaeCulture', checked === true)}
                    />
                    <Label htmlFor="algae" className="cursor-pointer">
                      Culture d'algues
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherActivities">Autres activités</Label>
                  <Textarea
                    id="otherActivities"
                    placeholder="Décrivez vos autres activités..."
                    value={formData.otherActivities}
                    onChange={(e) => handleInputChange('otherActivities', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

          {/* Boutons de navigation */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}

            <div className="flex-1" />

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-gradient-aqua text-white"
                disabled={!canProceedToNextStep()}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !canProceedToNextStep()}
                className="bg-gradient-aqua text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-aqua-600 dark:text-aqua-400 hover:text-aqua-700 dark:hover:text-aqua-300 underline"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedRegistration;