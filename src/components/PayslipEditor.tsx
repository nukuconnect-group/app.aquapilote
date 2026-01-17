import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, Edit2, Building2, FileText, Upload, Save, Image } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ExportDropdown from './ExportDropdown';
import { toast } from 'sonner';

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

// Taux de conversion des devises vers FCFA
const CURRENCY_TO_FCFA: Record<string, number> = {
  'EUR': 655.957,
  'USD': 615.00,
  'GBP': 780.00,
  'XOF': 1,
  'FCFA': 1,
  'CFA': 1,
  'XAF': 1
};

// Escape HTML to prevent XSS attacks
const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const PayslipEditor: React.FC<PayslipEditorProps> = ({ isOpen, onClose, paySlip, employee }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  // FCFA par défaut pour les bulletins de paie
  const [selectedCurrency, setSelectedCurrency] = useState<string>('FCFA');
  
  // Charger les préférences sauvegardées
  const loadSavedCompanyInfo = (): CompanyInfo => {
    try {
      const saved = localStorage.getItem('payslip_company_info');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erreur chargement préférences:', e);
    }
    return {
      name: 'Nom de votre entreprise',
      address: 'Adresse de l\'entreprise, BP XXX',
      phone: '+XXX XX XX XX XX',
      email: 'contact@entreprise.com',
      siret: '',
      naf: '',
      logoUrl: ''
    };
  };

  // Informations personnalisables de l'entreprise
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(loadSavedCompanyInfo);

  // Charger les données du bulletin sauvegardées
  const loadSavedPayslipData = () => {
    try {
      const saved = localStorage.getItem(`payslip_data_${paySlip.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erreur chargement données bulletin:', e);
    }
    return null;
  };

  const savedData = loadSavedPayslipData();

  // Données du bulletin modifiables
  const [editablePayslip, setEditablePayslip] = useState({
    baseSalary: savedData?.baseSalary ?? paySlip.baseSalary,
    overtime: savedData?.overtime ?? paySlip.overtime,
    bonuses: savedData?.bonuses ?? paySlip.bonuses,
    transportAllowance: savedData?.transportAllowance ?? 0,
    housingAllowance: savedData?.housingAllowance ?? 0,
    mealAllowance: savedData?.mealAllowance ?? 0,
    otherAllowances: savedData?.otherAllowances ?? 0,
    otherDeductions: savedData?.otherDeductions ?? 0
  });

  // Taux de cotisations modifiables
  const [rates, setRates] = useState({
    cnssEmployee: savedData?.rates?.cnssEmployee ?? 3.6,
    cnssEmployer: savedData?.rates?.cnssEmployer ?? 15.7,
    taxWithholding: savedData?.rates?.taxWithholding ?? 1.5,
    healthInsurance: savedData?.rates?.healthInsurance ?? 0,
    pension: savedData?.rates?.pension ?? 0,
    otherEmployerCharges: savedData?.rates?.otherEmployerCharges ?? 0
  });

  // Gérer l'upload du logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le logo ne doit pas dépasser 2 Mo');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCompanyInfo({ ...companyInfo, logoUrl: base64 });
        toast.success('Logo téléchargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder les infos entreprise dans localStorage
      localStorage.setItem('payslip_company_info', JSON.stringify(companyInfo));
      
      // Sauvegarder les données du bulletin
      const payslipDataToSave = {
        ...editablePayslip,
        rates,
        grossSalary,
        netSalary,
        totalDeductions,
        cnssEmployee,
        cnssEmployer,
        taxWithholding,
        healthInsurance,
        pension,
        otherEmployerCharges,
        totalEmployerCharges,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`payslip_data_${paySlip.id}`, JSON.stringify(payslipDataToSave));
      
      toast.success('Toutes les modifications ont été enregistrées avec succès');
    } catch (e) {
      console.error('Erreur sauvegarde:', e);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Convertir vers FCFA si une autre devise est sélectionnée
  const convertToFCFA = (value: number): number => {
    const rate = CURRENCY_TO_FCFA[selectedCurrency] || 1;
    return Math.round(value * rate);
  };

  // Formater en F CFA (conversion automatique)
  const formatCFA = (value: number) => {
    const convertedValue = selectedCurrency !== 'FCFA' && selectedCurrency !== 'XOF' && selectedCurrency !== 'XAF' && selectedCurrency !== 'CFA'
      ? convertToFCFA(value)
      : value;
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(convertedValue) + ' F CFA';
  };

  // Affichage de la devise originale pour référence
  const formatOriginalCurrency = (value: number) => {
    if (selectedCurrency === 'FCFA' || selectedCurrency === 'XOF' || selectedCurrency === 'XAF' || selectedCurrency === 'CFA') {
      return null;
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: selectedCurrency === 'EUR' ? 'EUR' : selectedCurrency === 'USD' ? 'USD' : 'GBP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calculs automatiques basés sur les taux
  const grossSalary = editablePayslip.baseSalary + 
    editablePayslip.overtime + 
    editablePayslip.bonuses +
    editablePayslip.transportAllowance +
    editablePayslip.housingAllowance +
    editablePayslip.mealAllowance +
    editablePayslip.otherAllowances;
  
  // Cotisations salariales
  const cnssEmployee = Math.round(grossSalary * (rates.cnssEmployee / 100));
  const taxWithholding = Math.round(grossSalary * (rates.taxWithholding / 100));
  const totalDeductions = cnssEmployee + taxWithholding + editablePayslip.otherDeductions;
  
  // Charges patronales
  const cnssEmployer = Math.round(grossSalary * (rates.cnssEmployer / 100));
  const healthInsurance = Math.round(grossSalary * (rates.healthInsurance / 100));
  const pension = Math.round(grossSalary * (rates.pension / 100));
  const otherEmployerCharges = Math.round(grossSalary * (rates.otherEmployerCharges / 100));
  const totalEmployerCharges = cnssEmployer + healthInsurance + pension + otherEmployerCharges;
  
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

    // Escape all user-controlled data to prevent XSS
    const safeCompanyName = escapeHtml(companyInfo.name);
    const safeCompanyAddress = escapeHtml(companyInfo.address);
    const safeCompanyPhone = escapeHtml(companyInfo.phone);
    const safeCompanyEmail = escapeHtml(companyInfo.email);
    const safeCompanySiret = escapeHtml(companyInfo.siret);
    const safeEmployeeName = escapeHtml(paySlip.employeeName);
    const safeEmployeeEmail = escapeHtml(employee?.email);
    const safeEmployeePhone = escapeHtml(employee?.phone);
    const safeEmployeePosition = escapeHtml(employee?.position);
    const safeEmployeeUnitName = escapeHtml(employee?.unitName);
    const safeEmployeeContractType = escapeHtml(employee?.contractType);
    const safePeriodLabel = escapeHtml(periodLabel);
    // Note: logoUrl is validated as base64 data URL from file upload, but still escaped in src attribute

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie - ${safeEmployeeName} - ${safePeriodLabel}</title>
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
        ${companyInfo.logoUrl ? `<img src="${escapeHtml(companyInfo.logoUrl)}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;" />` : ''}
        <h1>${safeCompanyName}</h1>
        <p>${safeCompanyAddress}</p>
        <p>Tél: ${safeCompanyPhone} | Email: ${safeCompanyEmail}</p>
        ${companyInfo.siret ? `<p>N° RCCM: ${safeCompanySiret}</p>` : ''}
      </div>
      <div class="document-title">
        <h2>BULLETIN DE PAIE</h2>
        <p>Période: ${safePeriodLabel.toUpperCase()}</p>
        <p style="font-size: 10px; color: #666; margin-top: 5px;">Émis le: ${generatedDate}</p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>IDENTIFICATION DU SALARIÉ</h3>
        <table>
          <tr><td>Nom et Prénom:</td><td>${safeEmployeeName}</td></tr>
          <tr><td>Email:</td><td>${safeEmployeeEmail || 'N/A'}</td></tr>
          <tr><td>Téléphone:</td><td>${safeEmployeePhone || 'N/A'}</td></tr>
        </table>
      </div>
      <div class="info-box">
        <h3>SITUATION PROFESSIONNELLE</h3>
        <table>
          <tr><td>Emploi:</td><td>${safeEmployeePosition || 'N/A'}</td></tr>
          <tr><td>Unité:</td><td>${safeEmployeeUnitName || 'N/A'}</td></tr>
          <tr><td>Type de contrat:</td><td>${safeEmployeeContractType || 'N/A'}</td></tr>
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
          <td>CNSS (Part salariale ${rates.cnssEmployee}%)</td>
          <td>${formatCFA(grossSalary)}</td>
          <td>-${formatCFA(cnssEmployee)}</td>
        </tr>
        <tr>
          <td>Impôt sur le revenu (IGR ${rates.taxWithholding}%)</td>
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
        <h4>CHARGES PATRONALES</h4>
        <p>CNSS employeur (${rates.cnssEmployer}%): ${formatCFA(cnssEmployer)}</p>
        ${healthInsurance > 0 ? `<p>Assurance maladie (${rates.healthInsurance}%): ${formatCFA(healthInsurance)}</p>` : ''}
        ${pension > 0 ? `<p>Retraite complémentaire (${rates.pension}%): ${formatCFA(pension)}</p>` : ''}
        ${otherEmployerCharges > 0 ? `<p>Autres charges (${rates.otherEmployerCharges}%): ${formatCFA(otherEmployerCharges)}</p>` : ''}
        <p class="amount" style="margin-top: 8px;">Total: ${formatCFA(totalEmployerCharges)}</p>
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
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button variant="outline" onClick={downloadHTML}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger (HTML/PDF)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-4 space-y-4">
            {/* Sélection devise avec conversion automatique */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Devise de saisie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['FCFA', 'EUR', 'USD', 'GBP'].map((curr) => (
                    <Button
                      key={curr}
                      variant={selectedCurrency === curr ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCurrency(curr)}
                    >
                      {curr}
                    </Button>
                  ))}
                </div>
                {selectedCurrency !== 'FCFA' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Taux de conversion: 1 {selectedCurrency} = {CURRENCY_TO_FCFA[selectedCurrency]} FCFA.
                    Les montants seront automatiquement convertis en FCFA sur le bulletin.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rémunération</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salaire de base ({selectedCurrency})</Label>
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
                <CardTitle className="text-base">Cotisations Salariales (Taux %)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>CNSS salarié (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.cnssEmployee}
                      onChange={(e) => setRates({...rates, cnssEmployee: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(cnssEmployee)}</p>
                  </div>
                  <div>
                    <Label>IGR / Impôt (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.taxWithholding}
                      onChange={(e) => setRates({...rates, taxWithholding: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(taxWithholding)}</p>
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
                <CardTitle className="text-base">Charges Patronales (Taux %)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CNSS employeur (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.cnssEmployer}
                      onChange={(e) => setRates({...rates, cnssEmployer: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(cnssEmployer)}</p>
                  </div>
                  <div>
                    <Label>Assurance maladie (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.healthInsurance}
                      onChange={(e) => setRates({...rates, healthInsurance: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(healthInsurance)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Retraite complémentaire (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.pension}
                      onChange={(e) => setRates({...rates, pension: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(pension)}</p>
                  </div>
                  <div>
                    <Label>Autres charges patronales (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rates.otherEmployerCharges}
                      onChange={(e) => setRates({...rates, otherEmployerCharges: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant: {formatCFA(otherEmployerCharges)}</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-800 dark:text-amber-200">Total charges patronales:</span>
                    <span className="font-bold text-amber-800 dark:text-amber-200">{formatCFA(totalEmployerCharges)}</span>
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
                    <span>CNSS salarié ({rates.cnssEmployee}%):</span>
                    <span className="text-red-600">-{formatCFA(cnssEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGR ({rates.taxWithholding}%):</span>
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
                  <div className="flex justify-between col-span-2 pt-2 border-t">
                    <span className="font-medium text-amber-700">Coût total employeur:</span>
                    <span className="font-semibold text-amber-700">{formatCFA(grossSalary + totalEmployerCharges)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
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
                  <Label>Logo de l'entreprise</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Télécharger un logo
                    </Button>
                    {companyInfo.logoUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setCompanyInfo({...companyInfo, logoUrl: ''})}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  {companyInfo.logoUrl && (
                    <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu du logo:</p>
                      <img 
                        src={companyInfo.logoUrl} 
                        alt="Logo entreprise" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">Ou entrez une URL</Label>
                    <Input
                      value={companyInfo.logoUrl?.startsWith('data:') ? '' : companyInfo.logoUrl}
                      onChange={(e) => setCompanyInfo({...companyInfo, logoUrl: e.target.value})}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Les informations seront réutilisées pour les prochains bulletins
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
