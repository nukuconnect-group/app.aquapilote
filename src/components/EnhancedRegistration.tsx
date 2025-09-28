import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Building, Users, Fish, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';

interface EnhancedRegistrationProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  selectedPlan?: string | null;
}

interface CompanyFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Informations entreprise
  companyName: string;
  companyType: string;
  numberOfEmployees: string;
  productionUnit: string[];
  activities: string[];
  annualProduction: string;
  address: string;
  phone: string;
  
  // Acceptation des conditions
  acceptTerms: boolean;
}

const EnhancedRegistration: React.FC<EnhancedRegistrationProps> = ({ 
  onClose, 
  onSwitchToLogin,
  selectedPlan = null 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyType: '',
    numberOfEmployees: '',
    productionUnit: [],
    activities: [],
    annualProduction: '',
    address: '',
    phone: '',
    acceptTerms: false
  });
  
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof CompanyFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: 'productionUnit' | 'activities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.password && formData.password === formData.confirmPassword;
  };

  const validateStep2 = () => {
    return formData.companyName && formData.companyType && formData.numberOfEmployees &&
           formData.productionUnit.length > 0 && formData.acceptTerms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2 && validateStep2()) {
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
        description: "Veuillez remplir tous les champs requis",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <img 
              src={aquaPilotLogo} 
              alt="AQUA PILOT" 
              className="w-12 h-12"
            />
          </div>
          <CardTitle className="text-center text-2xl">
            Créer votre compte AQUA PILOT
          </CardTitle>
          <div className="text-center text-sm text-gray-600">
            Étape {currentStep} sur 2 - {currentStep === 1 ? 'Informations personnelles' : 'Informations entreprise'}
          </div>
          
          {selectedPlan && (
            <div className="bg-aqua-50 p-3 rounded-lg border border-aqua-200 mt-4">
              <p className="text-sm text-aqua-800">
                <strong>Plan sélectionné :</strong> {getPlanName(selectedPlan)}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
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
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Nom de votre exploitation"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyType">Type d'entreprise *</Label>
                    <Select value={formData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Entreprise individuelle</SelectItem>
                        <SelectItem value="sarl">SARL</SelectItem>
                        <SelectItem value="sas">SAS</SelectItem>
                        <SelectItem value="cooperative">Coopérative</SelectItem>
                        <SelectItem value="association">Association</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="numberOfEmployees">Nombre d'employés *</Label>
                    <Select value={formData.numberOfEmployees} onValueChange={(value) => handleInputChange('numberOfEmployees', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre d'employés" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 employé</SelectItem>
                        <SelectItem value="2-5">2-5 employés</SelectItem>
                        <SelectItem value="6-10">6-10 employés</SelectItem>
                        <SelectItem value="11-20">11-20 employés</SelectItem>
                        <SelectItem value="21-50">21-50 employés</SelectItem>
                        <SelectItem value="50+">Plus de 50 employés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Unités de production * (plusieurs choix possibles)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Écloserie', 'Grossissement', 'Finition', 'Nurserie'].map((unit) => (
                      <div key={unit} className="flex items-center space-x-2">
                        <Checkbox 
                          id={unit}
                          checked={formData.productionUnit.includes(unit)}
                          onCheckedChange={() => handleMultiSelectChange('productionUnit', unit)}
                        />
                        <Label htmlFor={unit} className="text-sm cursor-pointer">{unit}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Activités (plusieurs choix possibles)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Commercialisation', 'Transformation', 'Algue culture', 'Recherche', 'Formation', 'Consulting'].map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={activity}
                          checked={formData.activities.includes(activity)}
                          onCheckedChange={() => handleMultiSelectChange('activities', activity)}
                        />
                        <Label htmlFor={activity} className="text-sm cursor-pointer">{activity}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="annualProduction">Production annuelle estimée</Label>
                  <Select value={formData.annualProduction} onValueChange={(value) => handleInputChange('annualProduction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la capacité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Moins de 10 tonnes</SelectItem>
                      <SelectItem value="medium">10-50 tonnes</SelectItem>
                      <SelectItem value="large">50-200 tonnes</SelectItem>
                      <SelectItem value="industrial">Plus de 200 tonnes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Adresse de l'exploitation</Label>
                  <Textarea
                    id="address"
                    placeholder="Adresse complète de votre exploitation"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked === true)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                    J'accepte les conditions d'utilisation et la politique de confidentialité *
                  </Label>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              {currentStep === 2 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              )}
              
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                
                <Button type="submit" className="bg-gradient-aqua text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {currentStep === 1 ? 'Suivant...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Suivant
                        </>
                      ) : (
                        <>
                          <Fish className="w-4 h-4 mr-2" />
                          Créer mon compte
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-aqua-600 hover:text-aqua-700 underline"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRegistration;