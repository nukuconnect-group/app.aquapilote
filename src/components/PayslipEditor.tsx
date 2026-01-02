import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, Edit2, Building2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ExportDropdown from './ExportDropdown';

interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  unitName: string;
  salary: number;
  hireDate: string;
  contractType: string;
}

interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  generatedAt: string;
  unitId: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  siret?: string;
  naf?: string;
  logoUrl?: string;
}

interface PayslipEditorProps {
  isOpen: boolean;
  onClose: () => void;
  paySlip: PaySlip;
  employee: Employee | null;
}

const PayslipEditor: React.FC<PayslipEditorProps> = ({ isOpen, onClose, paySlip, employee }) => {
  const [activeTab, setActiveTab] = useState('preview');
  
  // Informations personnalisables de l'entreprise
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Nom de votre entreprise',
    address: 'Adresse de l\'entreprise, BP XXX',
    phone: '+XXX XX XX XX XX',
    email: 'contact@entreprise.com',
    siret: '',
    naf: '',
    logoUrl: ''
  });

  // Données du bulletin modifiables
  const [editablePayslip, setEditablePayslip] = useState({
    baseSalary: paySlip.baseSalary,
    overtime: paySlip.overtime,
    bonuses: paySlip.bonuses,
    transportAllowance: 0,
    housingAllowance: 0,
    mealAllowance: 0,
    otherAllowances: 0,
    otherDeductions: 0
  });

  // Formater en F CFA
  const formatCFA = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' F CFA';
  };

  // Calculs
  const grossSalary = editablePayslip.baseSalary + 
    editablePayslip.overtime + 
    editablePayslip.bonuses +
    editablePayslip.transportAllowance +
    editablePayslip.housingAllowance +
    editablePayslip.mealAllowance +
    editablePayslip.otherAllowances;
  
  const cnssEmployee = Math.round(grossSalary * 0.036); // CNSS salarié 3.6%
  const taxWithholding = Math.round(grossSalary * 0.015); // IGR estimé 1.5%
  const totalDeductions = cnssEmployee + taxWithholding + editablePayslip.otherDeductions;
  const cnssEmployer = Math.round(grossSalary * 0.157); // CNSS employeur 15.7%
  const netSalary = grossSalary - totalDeductions;

  // Safe date parsing
  const getPeriodLabel = () => {
    try {
      if (!paySlip.period) return 'Période non définie';
      const parts = paySlip.period.split('-');
      if (parts.length !== 2) return paySlip.period;
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      if (isNaN(year) || isNaN(month)) return paySlip.period;
      const periodDate = new Date(year, month - 1, 1);
      if (isNaN(periodDate.getTime())) return paySlip.period;
      return format(periodDate, 'MMMM yyyy', { locale: fr });
    } catch {
      return paySlip.period || 'N/A';
    }
  };
  
  const periodLabel = getPeriodLabel();

  const safeFormatDate = (dateStr: string | null | undefined, defaultValue = 'N/A') => {
    try {
      if (!dateStr) return defaultValue;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return defaultValue;
      return format(date, 'dd/MM/yyyy');
    } catch {
      return defaultValue;
    }
  };

  const generatePreviewHTML = () => {
    const hireDate = safeFormatDate(employee?.hireDate);
    const generatedDate = safeFormatDate(paySlip.generatedAt, format(new Date(), 'dd/MM/yyyy'));

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie - ${paySlip.employeeName} - ${periodLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      border: 2px solid #1e40af;
      padding: 20px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      border-bottom: 3px solid #1e40af;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .company-info h1 { 
      color: #1e40af; 
      font-size: 20px; 
      margin-bottom: 5px;
    }
    .company-info p { font-size: 10px; color: #666; }
    .document-title {
      text-align: right;
    }
    .document-title h2 {
      color: #1e40af;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .document-title p {
      font-size: 12px;
      font-weight: bold;
    }
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 5px;
    }
    .info-box h3 {
      color: #1e40af;
      font-size: 12px;
      margin-bottom: 8px;
      border-bottom: 1px solid #1e40af;
      padding-bottom: 3px;
    }
    .info-box table { width: 100%; font-size: 10px; }
    .info-box td { padding: 2px 0; }
    .info-box td:first-child { color: #666; width: 45%; }
    .info-box td:last-child { font-weight: 500; }
    
    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .salary-table th {
      background: #1e40af;
      color: white;
      padding: 8px 5px;
      text-align: left;
      font-size: 10px;
    }
    .salary-table th:not(:first-child) { text-align: right; }
    .salary-table td {
      padding: 6px 5px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10px;
    }
    .salary-table td:not(:first-child) { text-align: right; }
    .salary-table .section-header {
      background: #e2e8f0;
      font-weight: bold;
    }
    .salary-table .subtotal {
      background: #f1f5f9;
      font-weight: 600;
    }
    .salary-table .net-row {
      background: #1e40af;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    
    .summary-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .summary-box {
      padding: 15px;
      border-radius: 5px;
    }
    .summary-box.employer {
      background: #fef3c7;
      border: 1px solid #f59e0b;
    }
    .summary-box.employee {
      background: #dbeafe;
      border: 1px solid #1e40af;
    }
    .summary-box h4 {
      font-size: 11px;
      margin-bottom: 8px;
    }
    .summary-box .amount {
      font-size: 16px;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 2px solid #e2e8f0;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
    }
    .signature-box {
      border: 1px dashed #ccc;
      padding: 15px;
      min-height: 80px;
    }
    .signature-box p {
      font-size: 9px;
      color: #666;
    }
    @media print {
      body { padding: 0; }
      .container { border: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        ${companyInfo.logoUrl ? `<img src="${companyInfo.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;" />` : ''}
        <h1>${companyInfo.name}</h1>
        <p>${companyInfo.address}</p>
        <p>Tél: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
        ${companyInfo.siret ? `<p>N° RCCM: ${companyInfo.siret}</p>` : ''}
      </div>
      <div class="document-title">
        <h2>BULLETIN DE PAIE</h2>
        <p>Période: ${periodLabel.toUpperCase()}</p>
        <p style="font-size: 10px; color: #666; margin-top: 5px;">Émis le: ${generatedDate}</p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>IDENTIFICATION DU SALARIÉ</h3>
        <table>
          <tr><td>Nom et Prénom:</td><td>${paySlip.employeeName}</td></tr>
          <tr><td>Email:</td><td>${employee?.email || 'N/A'}</td></tr>
          <tr><td>Téléphone:</td><td>${employee?.phone || 'N/A'}</td></tr>
        </table>
      </div>
      <div class="info-box">
        <h3>SITUATION PROFESSIONNELLE</h3>
        <table>
          <tr><td>Emploi:</td><td>${employee?.position || 'N/A'}</td></tr>
          <tr><td>Unité:</td><td>${employee?.unitName || 'N/A'}</td></tr>
          <tr><td>Type de contrat:</td><td>${employee?.contractType || 'N/A'}</td></tr>
          <tr><td>Date d'embauche:</td><td>${hireDate}</td></tr>
        </table>
      </div>
    </div>

    <table class="salary-table">
      <thead>
        <tr>
          <th style="width: 50%;">Libellé</th>
          <th style="width: 25%;">Base</th>
          <th style="width: 25%;">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr class="section-header">
          <td colspan="3">RÉMUNÉRATION BRUTE</td>
        </tr>
        <tr>
          <td>Salaire de base mensuel</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.baseSalary)}</td>
        </tr>
        ${editablePayslip.overtime > 0 ? `
        <tr>
          <td>Heures supplémentaires</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.overtime)}</td>
        </tr>
        ` : ''}
        ${editablePayslip.bonuses > 0 ? `
        <tr>
          <td>Primes et gratifications</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.bonuses)}</td>
        </tr>
        ` : ''}
        ${editablePayslip.transportAllowance > 0 ? `
        <tr>
          <td>Indemnité de transport</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.transportAllowance)}</td>
        </tr>
        ` : ''}
        ${editablePayslip.housingAllowance > 0 ? `
        <tr>
          <td>Indemnité de logement</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.housingAllowance)}</td>
        </tr>
        ` : ''}
        ${editablePayslip.mealAllowance > 0 ? `
        <tr>
          <td>Indemnité de repas</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.mealAllowance)}</td>
        </tr>
        ` : ''}
        ${editablePayslip.otherAllowances > 0 ? `
        <tr>
          <td>Autres indemnités</td>
          <td>-</td>
          <td>${formatCFA(editablePayslip.otherAllowances)}</td>
        </tr>
        ` : ''}
        <tr class="subtotal">
          <td>TOTAL BRUT</td>
          <td>-</td>
          <td>${formatCFA(grossSalary)}</td>
        </tr>

        <tr class="section-header">
          <td colspan="3">COTISATIONS SOCIALES</td>
        </tr>
        <tr>
          <td>CNSS (Part salariale 3.6%)</td>
          <td>${formatCFA(grossSalary)}</td>
          <td>-${formatCFA(cnssEmployee)}</td>
        </tr>
        <tr>
          <td>Impôt sur le revenu (IGR estimé)</td>
          <td>${formatCFA(grossSalary)}</td>
          <td>-${formatCFA(taxWithholding)}</td>
        </tr>
        ${editablePayslip.otherDeductions > 0 ? `
        <tr>
          <td>Autres retenues</td>
          <td>-</td>
          <td>-${formatCFA(editablePayslip.otherDeductions)}</td>
        </tr>
        ` : ''}
        <tr class="subtotal">
          <td>TOTAL RETENUES</td>
          <td>-</td>
          <td>-${formatCFA(totalDeductions)}</td>
        </tr>

        <tr class="net-row">
          <td>NET À PAYER</td>
          <td>-</td>
          <td>${formatCFA(netSalary)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-box employer">
        <h4>CHARGES PATRONALES (estimation)</h4>
        <p>CNSS employeur (15.7%): ${formatCFA(cnssEmployer)}</p>
        <p class="amount" style="margin-top: 8px;">Total: ${formatCFA(cnssEmployer)}</p>
      </div>
      <div class="summary-box employee">
        <h4>NET À PAYER AU SALARIÉ</h4>
        <p class="amount">${formatCFA(netSalary)}</p>
        <p style="font-size: 9px; color: #666; margin-top: 5px;">
          Mode de paiement: Virement bancaire
        </p>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <p><strong>L'Employeur</strong></p>
        <p>Date et signature:</p>
      </div>
      <div class="signature-box">
        <p><strong>Le Salarié</strong></p>
        <p>Date et signature:</p>
        <p style="margin-top: 5px;">"Lu et approuvé"</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    const content = generatePreviewHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulletin_${paySlip.employeeName.replace(' ', '_')}_${paySlip.period}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: string) => {
    const data = [{
      'Employé': paySlip.employeeName,
      'Période': periodLabel,
      'Salaire de base': editablePayslip.baseSalary,
      'Heures sup.': editablePayslip.overtime,
      'Primes': editablePayslip.bonuses,
      'Transport': editablePayslip.transportAllowance,
      'Logement': editablePayslip.housingAllowance,
      'Repas': editablePayslip.mealAllowance,
      'Autres indemnités': editablePayslip.otherAllowances,
      'Brut': grossSalary,
      'CNSS salarié': cnssEmployee,
      'IGR': taxWithholding,
      'Autres retenues': editablePayslip.otherDeductions,
      'Total retenues': totalDeductions,
      'Net à payer': netSalary
    }];

    if (format === 'pdf' || format === 'html') {
      downloadHTML();
    }
    // Pour CSV et Excel, on utilise ExportDropdown
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Édition du Bulletin de Paie - {paySlip.employeeName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </TabsTrigger>
            <TabsTrigger value="company">
              <Building2 className="w-4 h-4 mr-2" />
              Entreprise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={downloadHTML}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger (HTML/PDF)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rémunération</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salaire de base (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.baseSalary}
                      onChange={(e) => setEditablePayslip({...editablePayslip, baseSalary: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Heures supplémentaires (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.overtime}
                      onChange={(e) => setEditablePayslip({...editablePayslip, overtime: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primes (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.bonuses}
                      onChange={(e) => setEditablePayslip({...editablePayslip, bonuses: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Indemnité transport (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.transportAllowance}
                      onChange={(e) => setEditablePayslip({...editablePayslip, transportAllowance: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Indemnité logement (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.housingAllowance}
                      onChange={(e) => setEditablePayslip({...editablePayslip, housingAllowance: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Indemnité repas (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.mealAllowance}
                      onChange={(e) => setEditablePayslip({...editablePayslip, mealAllowance: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Autres indemnités (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.otherAllowances}
                      onChange={(e) => setEditablePayslip({...editablePayslip, otherAllowances: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Autres retenues (F CFA)</Label>
                    <Input
                      type="number"
                      value={editablePayslip.otherDeductions}
                      onChange={(e) => setEditablePayslip({...editablePayslip, otherDeductions: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Salaire brut:</span>
                    <span className="font-semibold">{formatCFA(grossSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CNSS salarié (3.6%):</span>
                    <span className="text-red-600">-{formatCFA(cnssEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGR (estimation):</span>
                    <span className="text-red-600">-{formatCFA(taxWithholding)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total retenues:</span>
                    <span className="text-red-600">-{formatCFA(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-2 border-t">
                    <span className="font-bold">Net à payer:</span>
                    <span className="font-bold text-green-600 text-lg">{formatCFA(netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>N° RCCM / SIRET</Label>
                    <Input
                      value={companyInfo.siret}
                      onChange={(e) => setCompanyInfo({...companyInfo, siret: e.target.value})}
                      placeholder="Numéro d'immatriculation"
                    />
                  </div>
                  <div>
                    <Label>Code NAF / Activité</Label>
                    <Input
                      value={companyInfo.naf}
                      onChange={(e) => setCompanyInfo({...companyInfo, naf: e.target.value})}
                      placeholder="Code activité"
                    />
                  </div>
                </div>
                <div>
                  <Label>URL du logo (optionnel)</Label>
                  <Input
                    value={companyInfo.logoUrl}
                    onChange={(e) => setCompanyInfo({...companyInfo, logoUrl: e.target.value})}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez l'URL d'une image pour votre logo d'entreprise
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PayslipEditor;
