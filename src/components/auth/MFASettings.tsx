import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ShieldCheck, ShieldOff, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MFAEnrollment from './MFAEnrollment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
  created_at: string;
}

const MFASettings: React.FC = () => {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [isDisabling, setIsDisabling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFactors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        throw error;
      }

      if (data) {
        // Filter to only show TOTP factors
        const totpFactors = data.totp.map(f => ({
          ...f,
          created_at: f.created_at || new Date().toISOString()
        }));
        setFactors(totpFactors);
      }
    } catch (err: any) {
      console.error('Error fetching MFA factors:', err);
      setError(err.message || 'Erreur lors du chargement des paramètres 2FA');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  const handleUnenroll = async (factorId: string) => {
    setIsDisabling(factorId);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId
      });

      if (error) {
        throw error;
      }

      toast({
        title: "2FA désactivé",
        description: "L'authentification à deux facteurs a été désactivée.",
      });

      await fetchFactors();
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de désactiver le 2FA",
        variant: "destructive",
      });
    } finally {
      setIsDisabling(null);
    }
  };

  const handleEnrollmentComplete = () => {
    setShowEnrollment(false);
    fetchFactors();
  };

  const verifiedFactors = factors.filter(f => f.status === 'verified');
  const hasMFA = verifiedFactors.length > 0;

  if (showEnrollment) {
    return (
      <MFAEnrollment
        onComplete={handleEnrollmentComplete}
        onCancel={() => setShowEnrollment(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasMFA ? (
              <ShieldCheck className="h-6 w-6 text-green-500" />
            ) : (
              <ShieldOff className="h-6 w-6 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-lg">Authentification à deux facteurs (2FA)</CardTitle>
              <CardDescription>
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </CardDescription>
            </div>
          </div>
          <Badge variant={hasMFA ? "default" : "secondary"}>
            {hasMFA ? "Activé" : "Désactivé"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!hasMFA && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Protégez votre compte en activant l'authentification à deux facteurs. 
              Vous aurez besoin d'une application comme Google Authenticator ou Authy.
            </AlertDescription>
          </Alert>
        )}

        {verifiedFactors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Méthodes configurées</h4>
            {verifiedFactors.map((factor) => (
              <div
                key={factor.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">
                      {factor.friendly_name || 'Application Authenticator'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Configuré le {new Date(factor.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isDisabling === factor.id}
                    >
                      {isDisabling === factor.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Désactiver le 2FA ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera l'authentification à deux facteurs de votre compte. 
                        Votre compte sera moins sécurisé. Vous pourrez le réactiver à tout moment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUnenroll(factor.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Désactiver
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => setShowEnrollment(true)}
          className="w-full"
          variant={hasMFA ? "outline" : "default"}
        >
          <Shield className="h-4 w-4 mr-2" />
          {hasMFA ? "Ajouter une autre méthode" : "Activer le 2FA"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MFASettings;
