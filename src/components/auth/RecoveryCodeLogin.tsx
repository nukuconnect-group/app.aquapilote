import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecoveryCodeLoginProps {
  onVerified: () => void;
  onBack: () => void;
  onVerifyCode: (code: string) => Promise<boolean>;
}

const RecoveryCodeLogin: React.FC<RecoveryCodeLoginProps> = ({ 
  onVerified, 
  onBack,
  onVerifyCode 
}) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const formatCode = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedCode = formatCode(code);
    if (formattedCode.length !== 8) {
      setError('Le code de récupération doit contenir 8 caractères');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const success = await onVerifyCode(formattedCode);
      
      if (success) {
        toast({
          title: "✅ Code validé",
          description: "Connexion réussie avec le code de récupération.",
        });
        onVerified();
      } else {
        setError('Code de récupération invalide ou déjà utilisé');
        setCode('');
      }
    } catch (err: any) {
      console.error('Recovery code verification error:', err);
      setError(err.message || 'Erreur lors de la vérification du code');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Code de récupération</CardTitle>
        <CardDescription>
          Entrez l'un de vos codes de récupération pour accéder à votre compte
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recoveryCode" className="sr-only">Code de récupération</Label>
            <Input
              id="recoveryCode"
              type="text"
              maxLength={10}
              placeholder="XXXXXXXX"
              value={code}
              onChange={(e) => setCode(formatCode(e.target.value))}
              className="text-center text-2xl tracking-widest font-mono uppercase"
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Les codes sont composés de 8 caractères
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || formatCode(code).length !== 8}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Chaque code de récupération ne peut être utilisé qu'une seule fois. 
            Après utilisation, pensez à en générer de nouveaux dans les paramètres.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecoveryCodeLogin;
