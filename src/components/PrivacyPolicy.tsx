import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';
import aquaPilotLogo from '@/assets/aquapilote-logo.png';
interface PrivacyPolicyProps {
  onAccept: () => void;
}
const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onAccept
}) => {
  const [isAccepted, setIsAccepted] = useState(false);
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-aqua-50 to-blue-100">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img src={aquaPilotLogo} alt="AquaPilote" className="h-16 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-aqua-600" />
            Politique de Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full border rounded-lg p-4">
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Collecte des données</h3>
                <p>
                  AQUA PILOT collecte uniquement les données nécessaires au fonctionnement de votre exploitation aquacole : 
                  informations d'entreprise, données de production, métriques de performance et paramètres de gestion.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Utilisation des données</h3>
                <p>
                  Vos données sont utilisées exclusivement pour l'optimisation de votre production aquacole, 
                  la génération de rapports personnalisés et l'amélioration de nos services.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Protection et sécurité</h3>
                <p>
                  Nous utilisons des protocoles de sécurité avancés (chiffrement SSL, sauvegarde automatique) 
                  pour protéger vos données. Elles ne sont jamais partagées avec des tiers sans votre consentement explicite.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Vos droits</h3>
                <p>
                  Vous disposez d'un droit d'accès, de modification et de suppression de vos données personnelles. 
                  Contactez-nous à support@aquapilot.com pour exercer ces droits.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Cookies et tracking</h3>
                <p>
                  Nous utilisons des cookies essentiels au fonctionnement de l'application. 
                  Aucun tracking publicitaire n'est effectué.
                </p>
              </div>
            </div>
          </ScrollArea>

          <label
            htmlFor="privacy-accept"
            className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${isAccepted ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'}`}
          >
            <Checkbox
              id="privacy-accept"
              checked={isAccepted}
              onCheckedChange={checked => setIsAccepted(checked === true)}
              className="h-5 w-5 shrink-0 aspect-square rounded-[4px] border-2 border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">
              J'ai lu et j'accepte la politique de confidentialité d'AquaPilote
            </span>
          </label>

          <Button onClick={onAccept} disabled={!isAccepted} className="w-full bg-gradient-aqua text-white bg-zinc-800 hover:bg-zinc-700">
            <FileText className="w-4 h-4 mr-2" />
            Continuer
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default PrivacyPolicy;