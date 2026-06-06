import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Copy, Key, Link, Mail, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteData: {
    name: string;
    email: string;
    role: string;
    customRole: string;
    department: string;
    unitPermissions: { unitId: string; unitName: string; permissions: Record<string, boolean> }[];
  };
  generatedPassword: string;
  setGeneratedPassword: (pw: string) => void;
  setInviteDataPassword: (pw: string) => void;
  generatePasswordLocal: () => string;
  isSubmitting: boolean;
  onConfirmAndCreate: (sendEmail: boolean) => void;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  open,
  onOpenChange,
  inviteData,
  generatedPassword,
  setGeneratedPassword,
  setInviteDataPassword,
  generatePasswordLocal,
  isSubmitting,
  onConfirmAndCreate,
}) => {
  const { toast } = useToast();
  const loginUrl = `${window.location.origin}/auth`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Résumé du compte à créer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nom</span>
              <span className="font-medium">{inviteData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unités assignées</span>
              <span>{inviteData.unitPermissions.length} unité(s)</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Identifiants de connexion
            </h4>

            <div>
              <Label className="text-muted-foreground text-xs">Email (identifiant)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={inviteData.email} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(inviteData.email); toast({ title: "Email copié" }); }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Mot de passe</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="text"
                  value={generatedPassword}
                  onChange={(e) => { setGeneratedPassword(e.target.value); setInviteDataPassword(e.target.value); }}
                  className="font-mono text-sm"
                  placeholder="Mot de passe"
                />
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(generatedPassword); toast({ title: "Mot de passe copié" }); }}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => { const np = generatePasswordLocal(); setGeneratedPassword(np); setInviteDataPassword(np); toast({ title: "Nouveau mot de passe généré" }); }} title="Générer un nouveau mot de passe">
                  <Key className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mot de passe visible et modifiable. Cliquez sur l'icône clé pour en générer un nouveau.
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Lien de connexion</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={loginUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(loginUrl); toast({ title: "Lien copié" }); }}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.open(loginUrl, '_blank')}>
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const message = `Bonjour ${inviteData.name},\n\nVotre compte AquaPilote a été créé.\n\nLien de connexion: ${loginUrl}\nEmail: ${inviteData.email}\nMot de passe: ${generatedPassword}\n\nVeuillez changer votre mot de passe après votre première connexion.`;
              navigator.clipboard.writeText(message);
              toast({ title: "Message complet copié", description: "Vous pouvez le coller dans un email ou message" });
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copier tous les identifiants
          </Button>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={() => onConfirmAndCreate(true)} disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Mail className="w-4 h-4 mr-2" />
            Créer et envoyer par email
          </Button>
          <Button variant="secondary" onClick={() => onConfirmAndCreate(false)} disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Créer sans envoyer d'email
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full">
            Retour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
