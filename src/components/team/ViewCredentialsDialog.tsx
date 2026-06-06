import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Key, Edit, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { TeamMember } from '@/hooks/useTeamMembers';

interface ViewCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  loginUrl: string;
  onResetPassword: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

const ViewCredentialsDialog: React.FC<ViewCredentialsDialogProps> = ({
  open,
  onOpenChange,
  member,
  loginUrl,
  onResetPassword,
  onEdit,
  getStatusColor,
  getStatusLabel,
}) => {
  const { toast } = useToast();
  const { t } = useSettings();

  if (!member) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t('copied'), description: `${label} ${t('copied_to_clipboard')}` });
    } catch {
      toast({ title: t('error'), description: t('copy_error'), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Détails du membre
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {member.member_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{member.member_name}</h4>
                <p className="text-sm text-muted-foreground">{member.custom_role || member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {member.department && <Badge variant="secondary">{member.department}</Badge>}
              <Badge className={getStatusColor(member.status)}>{getStatusLabel(member.status)}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Key className="w-4 h-4" />
              Identifiants de connexion
            </h4>
            <div>
              <Label className="text-muted-foreground text-xs">Email (identifiant)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={member.member_email} readOnly className="font-mono text-sm bg-background" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(member.member_email, 'Email')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Lien de connexion</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={loginUrl} readOnly className="font-mono text-sm bg-background" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(loginUrl, 'Lien')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Le mot de passe n'est pas stocké en clair. Utilisez <strong>"Réinitialiser le mot de passe"</strong> pour en générer un nouveau.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const message = `Identifiants AquaPilote\n\nNom: ${member.member_name}\nEmail: ${member.member_email}\nLien de connexion: ${loginUrl}`;
                copyToClipboard(message, 'Informations');
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier les informations
            </Button>
            <Button variant="default" className="w-full" onClick={() => { onOpenChange(false); onResetPassword(member); }}>
              <Key className="w-4 h-4 mr-2" />
              Réinitialiser le mot de passe
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => { onOpenChange(false); onEdit(member); }}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier le membre
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCredentialsDialog;
