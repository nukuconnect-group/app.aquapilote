import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-main.png';
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
          <div className="flex justify-center mb-6">
            <div className="relative group">
              {/* Effet de lueur en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-500/30 blur-3xl group-hover:blur-[60px] transition-all duration-700 animate-pulse" />
              
              {/* Logo avec effet 3D */}
              <img 
                src={aquaPilotLogo} 
                alt="AQUA PILOT" 
                className="relative h-32 sm:h-40 w-auto object-contain transform hover:scale-110 transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.4))',
                  transform: 'perspective(1000px) rotateX(5deg)',
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            <Shield className="w-6 h-6 text-primary" />
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

          <div className="flex items-center space-x-2 p-4 bg-aqua-50 rounded-lg">
            <Checkbox id="privacy-accept" checked={isAccepted} onCheckedChange={checked => setIsAccepted(checked === true)} />
            <label htmlFor="privacy-accept" className="text-sm text-gray-700 cursor-pointer">
              J'ai lu et j'accepte la politique de confidentialité d'AQUA PILOT
            </label>
          </div>

          <Button onClick={onAccept} disabled={!isAccepted} className="w-full bg-gradient-aqua text-white bg-zinc-800 hover:bg-zinc-700">
            <FileText className="w-4 h-4 mr-2" />
            Continuer
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default PrivacyPolicy;