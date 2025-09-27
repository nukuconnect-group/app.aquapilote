import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface PrivacyPolicyProps {
  onAccept: () => void;
  onDecline: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);
  const { t } = useSettings();

  const handleAccept = () => {
    if (!accepted) return;
    localStorage.setItem('privacy-policy-accepted', 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Shield className="w-6 h-6 text-blue-600" />
            Politique de Confidentialité & Conditions d'Utilisation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Veuillez lire et accepter nos conditions avant de continuer
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full border rounded-lg p-4">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  1. Collecte et Utilisation des Données
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  AQUA PILOT collecte uniquement les données nécessaires au fonctionnement optimal de votre exploitation piscicole. 
                  Cela inclut les données de production, les mesures environnementales, et les informations de gestion.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Protection des Données</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous utilisons des protocoles de sécurité 
                  de niveau professionnel pour protéger vos informations sensibles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Partage des Données</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Vos données ne sont jamais partagées avec des tiers sans votre consentement explicite. 
                  Elles restent votre propriété exclusive.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Cookies et Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous utilisons des cookies essentiels pour le fonctionnement de l'application et l'amélioration de votre expérience utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. Sauvegardes et Récupération</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Des sauvegardes automatiques sont effectuées quotidiennement pour garantir la sécurité et la récupération de vos données.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6. Vos Droits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Vous avez le droit d'accéder, modifier, supprimer ou exporter vos données à tout moment depuis vos paramètres utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7. Contact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant cette politique, contactez-nous à : privacy@aqua-pilot.com
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-3 py-4 border-t">
            <Checkbox 
              id="accept-privacy" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label 
              htmlFor="accept-privacy" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'ai lu et j'accepte la politique de confidentialité et les conditions d'utilisation
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="flex-1 sm:flex-none"
            >
              Refuser
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              Accepter et Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;