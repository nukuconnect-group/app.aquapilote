
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Eye, Edit, Plus, Image, Settings } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'payslip';
  logo?: string;
  header: string;
  footer: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  fields: string[];
  isDefault: boolean;
  createdAt: string;
}

const DocumentTemplateManager = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    {
      id: '1',
      name: 'Facture Standard',
      type: 'invoice',
      header: 'FERME PISCICOLE AQUA-PLUS',
      footer: 'Merci de votre confiance - Paiement sous 30 jours',
      colors: {
        primary: '#2563eb',
        secondary: '#f1f5f9',
        text: '#1e293b'
      },
      fields: ['date', 'client', 'items', 'total', 'tva'],
      isDefault: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Reçu Simple',
      type: 'receipt',
      header: 'REÇU DE PAIEMENT',
      footer: 'Document généré automatiquement',
      colors: {
        primary: '#059669',
        secondary: '#ecfdf5',
        text: '#065f46'
      },
      fields: ['date', 'amount', 'client', 'method'],
      isDefault: false,
      createdAt: '2024-01-20'
    }
  ]);

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice' as 'invoice' | 'receipt' | 'payslip',
    header: '',
    footer: '',
    primaryColor: '#2563eb',
    secondaryColor: '#f1f5f9',
    textColor: '#1e293b',
    fields: [] as string[]
  });

  const availableFields = {
    invoice: ['date', 'client', 'items', 'subtotal', 'tva', 'total', 'reference'],
    receipt: ['date', 'amount', 'client', 'method', 'reference'],
    payslip: ['employee', 'period', 'salary', 'deductions', 'net']
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.header) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const template: DocumentTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      header: formData.header,
      footer: formData.footer,
      colors: {
        primary: formData.primaryColor,
        secondary: formData.secondaryColor,
        text: formData.textColor
      },
      fields: formData.fields,
      isDefault: false,
      createdAt: editingTemplate?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
      addLog('Modèle modifié', 'Documents', `Modèle "${formData.name}" modifié`, 'info');
    } else {
      setTemplates([...templates, template]);
      addLog('Modèle créé', 'Documents', `Nouveau modèle "${formData.name}" créé`, 'success');
    }

    toast({
      title: editingTemplate ? "Modèle modifié" : "Modèle créé",
      description: `Le modèle "${formData.name}" a été sauvegardé`
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'invoice',
      header: '',
      footer: '',
      primaryColor: '#2563eb',
      secondaryColor: '#f1f5f9',
      textColor: '#1e293b',
      fields: []
    });
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setFormData({
      name: template.name,
      type: template.type,
      header: template.header,
      footer: template.footer,
      primaryColor: template.colors.primary,
      secondaryColor: template.colors.secondary,
      textColor: template.colors.text,
      fields: template.fields
    });
    setEditingTemplate(template);
    setShowTemplateForm(true);
  };

  const setAsDefault = (templateId: string) => {
    setTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
    
    const template = templates.find(t => t.id === templateId);
    toast({
      title: "Modèle par défaut",
      description: `"${template?.name}" défini comme modèle par défaut`
    });
  };

  const generatePreviewContent = (template: DocumentTemplate) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aperçu - ${template.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: ${template.colors.text};
            }
            .header { 
              text-align: center; 
              background: ${template.colors.secondary}; 
              padding: 20px; 
              border-left: 4px solid ${template.colors.primary};
              margin-bottom: 30px;
            }
            .header h1 { 
              color: ${template.colors.primary}; 
              margin: 0;
            }
            .content { margin: 20px 0; }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding: 15px;
              background: ${template.colors.secondary};
              font-size: 0.9em;
            }
            .field { margin: 10px 0; padding: 8px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: ${template.colors.primary}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${template.header}</h1>
          </div>
          
          <div class="content">
            ${template.fields.map(field => `
              <div class="field">
                <span class="label">${field.toUpperCase()}:</span>
                <span>[${field} - exemple]</span>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            ${template.footer}
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = (template: DocumentTemplate) => {
    const content = generatePreviewContent(template);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Modèles de Documents
          </h3>
          <p className="text-sm text-gray-600">Créez et personnalisez vos modèles de factures, reçus et bulletins</p>
        </div>
        <Button onClick={() => setShowTemplateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Modèle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.isDefault && (
                  <Badge className="bg-green-100 text-green-800">Par défaut</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {template.type === 'invoice' ? 'Facture' : 
                   template.type === 'receipt' ? 'Reçu' : 'Bulletin'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">En-tête:</p>
                  <p className="text-gray-600 truncate">{template.header}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.colors.primary }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.colors.secondary }}
                  ></div>
                  <span className="text-xs text-gray-500">Couleurs</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {template.fields.slice(0, 3).map(field => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                  {template.fields.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.fields.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setAsDefault(template.id)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/modifier un modèle */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle de document'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="fields">Champs</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du modèle *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Facture Premium"
                  />
                </div>
                <div>
                  <Label>Type de document *</Label>
                  <Select value={formData.type} onValueChange={(value: 'invoice' | 'receipt' | 'payslip') => 
                    setFormData({...formData, type: value, fields: []})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Facture</SelectItem>
                      <SelectItem value="receipt">Reçu</SelectItem>
                      <SelectItem value="payslip">Bulletin de paie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>En-tête *</Label>
                <Input
                  value={formData.header}
                  onChange={(e) => setFormData({...formData, header: e.target.value})}
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div>
                <Label>Pied de page</Label>
                <Textarea
                  value={formData.footer}
                  onChange={(e) => setFormData({...formData, footer: e.target.value})}
                  placeholder="Informations de contact, conditions..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Couleur principale</Label>
                  <Input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Couleur secondaire</Label>
                  <Input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Couleur du texte</Label>
                  <Input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg" style={{ 
                background: formData.secondaryColor,
                borderColor: formData.primaryColor 
              }}>
                <h4 style={{ color: formData.primaryColor }} className="font-bold mb-2">
                  Aperçu des couleurs
                </h4>
                <p style={{ color: formData.textColor }}>
                  {formData.header || 'Votre en-tête apparaîtra ici'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div>
                <Label>Champs disponibles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableFields[formData.type].map(field => (
                    <label key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.fields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, fields: [...formData.fields, field]});
                          } else {
                            setFormData({...formData, fields: formData.fields.filter(f => f !== field)});
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Champs sélectionnés</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.fields.map(field => (
                    <Badge key={field} variant="secondary">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Modifier' : 'Créer'} le modèle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTemplateManager;
