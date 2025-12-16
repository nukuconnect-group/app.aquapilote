import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CreditCard, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuspensionNoticeProps {
  reason?: string;
  suspendedAt?: string;
}

const SuspensionNotice: React.FC<SuspensionNoticeProps> = ({ reason, suspendedAt }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="max-w-lg w-full border-destructive/50 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Compte suspendu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Votre accès à l'application a été temporairement suspendu.
            </p>
            {reason && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">
                  Raison: {reason}
                </p>
              </div>
            )}
            {suspendedAt && (
              <p className="text-xs text-muted-foreground">
                Suspendu le: {new Date(suspendedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Régulariser votre situation
              </h4>
              <p className="text-sm text-muted-foreground">
                Pour réactiver votre compte, veuillez régulariser votre paiement ou contacter notre équipe support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1" 
                variant="default"
                onClick={() => window.location.href = 'mailto:support@aquapilote.com?subject=Réactivation de compte'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, contactez-nous immédiatement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspensionNotice;
