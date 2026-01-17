import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Smartphone, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface MFAEnrollmentProps {
  onComplete: () => void;
  onCancel: () => void;
}

const MFAEnrollment: React.FC<MFAEnrollmentProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'loading' | 'qr' | 'verify'>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    try {
      setStep('loading');
      setError(null);

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'AQUA PILOT Authenticator'
      });

      if (error) {
        throw error;
      }

      if (data) {
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setStep('qr');
      }
    } catch (err: any) {
      console.error('MFA enrollment error:', err);
      setError(err.message || 'Erreur lors de la configuration 2FA');
      setStep('qr');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!factorId || verifyCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) {
        throw verifyError;
      }

      toast({
        title: "✅ 2FA activé",
        description: "L'authentification à deux facteurs est maintenant active sur votre compte.",
      });

      onComplete();
    } catch (err: any) {
      console.error('MFA verification error:', err);
      setError(err.message || 'Code invalide. Vérifiez et réessayez.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "La clé secrète a été copiée dans le presse-papiers.",
      });
    }
  };

  if (step === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Configuration du 2FA...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Configurer l'authentification 2FA</CardTitle>
        <CardDescription>
          Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qrCode && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Scannez avec votre application</span>
            </div>
          </div>
        )}

        {secret && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Ou entrez la clé manuellement :
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                {secret}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copySecret}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verifyCode">Code de vérification</Label>
            <Input
              id="verifyCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
            />
            <p className="text-xs text-muted-foreground text-center">
              Entrez le code à 6 chiffres de votre application
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || verifyCode.length !== 6}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Activer 2FA'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MFAEnrollment;
