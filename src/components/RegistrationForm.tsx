import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Building, Factory, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string | null;
  onToggleToLogin: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  isOpen, 
  onClose, 
  selectedPlan = null,
  onToggleToLogin 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    entreprise: '',
    address: '',
    country: '',
    city: '',
    totalPersonnel: '',
    ouvriers: '',
    cadres: '',
    uniteType: '' as 'ecloserie' | 'grossissement' | 'commercialisation' | 'autre' | ''
  });
  
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs",
          variant: "destructive",
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Utiliser une API de géocodage inverse pour obtenir l'adresse
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo_key&limit=1`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              setFormData({
                ...formData,
                address: result.formatted,
                country: result.components.country || '',
                city: result.components.city || result.components.town || ''
              });
              
              toast({
                title: "Position détectée",
                description: "Votre localisation a été mise à jour",
              });
            }
          } catch (error) {
            console.error('Erreur de géocodage:', error);
            toast({
              title: "Information",
              description: "Position GPS détectée, veuillez saisir votre adresse manuellement",
            });
          }
        },
        (error) => {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible d'obtenir votre position. Veuillez saisir votre adresse manuellement.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.uniteType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type d'unité",
        variant: "destructive",
      });
      return;
    }
    
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      entreprise: formData.entreprise,
      location: {
        address: formData.address,
        country: formData.country,
        city: formData.city
      },
      personnel: {
        totalPersonnel: parseInt(formData.totalPersonnel) || 0,
        ouvriers: parseInt(formData.ouvriers) || 0,
        cadres: parseInt(formData.cadres) || 0
      },
      uniteType: formData.uniteType as 'ecloserie' | 'grossissement' | 'commercialisation' | 'autre'
    };

    const success = await register(userData, selectedPlan || 'trial');
    if (success) {
      toast({
        title: "Compte créé avec succès",
        description: "Bienvenue dans AQUA PILOTE !",
      });
      onClose();
    } else {
      toast({
        title: "Erreur lors de l'inscription",
        description: "Veuillez réessayer",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl">
            Créer un compte AQUA PILOTE
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Étape {step} sur 3 - Rejoignez notre plateforme de gestion aquacole
          </DialogDescription>
          
          {selectedPlan && (
            <div className="bg-aqua-50 p-3 rounded-lg border border-aqua-200 mt-4">
              <p className="text-sm text-aqua-800">
                <strong>Plan sélectionné :</strong> {getPlanName(selectedPlan)}
              </p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-aqua-600" />
                  <h3 className="text-lg font-semibold">Informations personnelles</h3>
                </div>

                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Prénom Nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-aqua-600" />
                  <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>
                </div>

                <div>
                  <Label htmlFor="entreprise">Nom de l'entreprise *</Label>
                  <Input
                    id="entreprise"
                    type="text"
                    placeholder="Nom de votre exploitation aquacole"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Localisation *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeolocation}
                      className="shrink-0"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Position actuelle
                    </Button>
                    <Input
                      placeholder="Adresse complète"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Ville"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="Pays"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="uniteType">Type d'unité de production *</Label>
                  <Select
                    value={formData.uniteType}
                    onValueChange={(value) => setFormData({ ...formData, uniteType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecloserie">Écloserie</SelectItem>
                      <SelectItem value="grossissement">Grossissement de poisson</SelectItem>
                      <SelectItem value="commercialisation">Commercialisation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Factory className="w-5 h-5 text-aqua-600" />
                  <h3 className="text-lg font-semibold">Informations sur le personnel</h3>
                </div>

                <div>
                  <Label htmlFor="totalPersonnel">Nombre total de personnel</Label>
                  <Input
                    id="totalPersonnel"
                    type="number"
                    placeholder="0"
                    value={formData.totalPersonnel}
                    onChange={(e) => setFormData({ ...formData, totalPersonnel: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ouvriers">Nombre d'ouvriers</Label>
                    <Input
                      id="ouvriers"
                      type="number"
                      placeholder="0"
                      value={formData.ouvriers}
                      onChange={(e) => setFormData({ ...formData, ouvriers: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cadres">Nombre de cadres</Label>
                    <Input
                      id="cadres"
                      type="number"
                      placeholder="0"
                      value={formData.cadres}
                      onChange={(e) => setFormData({ ...formData, cadres: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Récapitulatif de votre inscription</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom :</strong> {formData.name}</p>
                    <p><strong>Email :</strong> {formData.email}</p>
                    <p><strong>Entreprise :</strong> {formData.entreprise}</p>
                    <p><strong>Type d'unité :</strong> {formData.uniteType}</p>
                    <p><strong>Personnel total :</strong> {formData.totalPersonnel || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Précédent
              </Button>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep} className="ml-auto">
                Suivant
              </Button>
            ) : (
              <Button type="submit" className="ml-auto bg-gradient-aqua text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleToLogin}
              className="text-sm text-aqua-600 hover:text-aqua-700 underline"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationForm;