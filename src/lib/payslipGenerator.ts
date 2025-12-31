import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface PaySlipDetails {
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  overtime: number;
  overtimeHours?: number;
  bonuses: number;
  transportAllowance?: number;
  housingAllowance?: number;
  mealAllowance?: number;
  deductions: number;
  cnssEmployee?: number;
  cnssEmployer?: number;
  healthInsurance?: number;
  taxWithholding?: number;
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
}

export const calculatePayslipDetails = (
  employee: Employee,
  baseSalary: number,
  overtime: number,
  bonuses: number,
  period: string
): PaySlipDetails => {
  // Calcul du brut
  const grossSalary = baseSalary + overtime + bonuses;
  
  // Cotisations salariales (environ 22% du brut)
  const cnssEmployee = Math.round(grossSalary * 0.0545); // CNSS employé
  const healthInsurance = Math.round(grossSalary * 0.0375); // Maladie
  const retirementEmployee = Math.round(grossSalary * 0.069); // Retraite
  const unemploymentEmployee = Math.round(grossSalary * 0.024); // Chômage
  const csgDeductible = Math.round(grossSalary * 0.068); // CSG déductible
  
  const totalEmployeeDeductions = cnssEmployee + healthInsurance + retirementEmployee + unemploymentEmployee + csgDeductible;
  
  // Cotisations patronales (environ 42% du brut)
  const cnssEmployer = Math.round(grossSalary * 0.0875); // CNSS employeur
  const healthEmployer = Math.round(grossSalary * 0.128); // Maladie employeur
  const retirementEmployer = Math.round(grossSalary * 0.0855); // Retraite employeur
  const unemploymentEmployer = Math.round(grossSalary * 0.0405); // Chômage employeur
  const accidentWork = Math.round(grossSalary * 0.02); // Accident du travail
  const familyAllowance = Math.round(grossSalary * 0.0345); // Allocations familiales
  
  const totalEmployerContributions = cnssEmployer + healthEmployer + retirementEmployer + unemploymentEmployer + accidentWork + familyAllowance;
  
  // Salaire net
  const netSalary = grossSalary - totalEmployeeDeductions;
  
  return {
    employeeId: '',
    employeeName: `${employee.firstName} ${employee.lastName}`,
    period,
    baseSalary,
    overtime,
    bonuses,
    deductions: totalEmployeeDeductions,
    cnssEmployee,
    cnssEmployer: totalEmployerContributions,
    healthInsurance,
    netSalary,
    generatedAt: new Date().toISOString().split('T')[0],
    unitId: '',
  };
};

export const generateProfessionalPayslipHTML = (
  employee: Employee,
  payslipData: PaySlipDetails,
  companyInfo: CompanyInfo,
  formatCurrency: (value: number) => string
): string => {
  const grossSalary = payslipData.baseSalary + payslipData.overtime + payslipData.bonuses;
  
  // Calcul détaillé des cotisations
  const cnssEmployee = Math.round(grossSalary * 0.0545);
  const healthEmployee = Math.round(grossSalary * 0.0375);
  const retirementEmployee = Math.round(grossSalary * 0.069);
  const unemploymentEmployee = Math.round(grossSalary * 0.024);
  const csgDeductible = Math.round(grossSalary * 0.068);
  const csgNonDeductible = Math.round(grossSalary * 0.024);
  const crds = Math.round(grossSalary * 0.005);
  
  const totalEmployeeDeductions = cnssEmployee + healthEmployee + retirementEmployee + unemploymentEmployee + csgDeductible + csgNonDeductible + crds;
  
  const cnssEmployer = Math.round(grossSalary * 0.0875);
  const healthEmployer = Math.round(grossSalary * 0.128);
  const retirementEmployer = Math.round(grossSalary * 0.0855);
  const unemploymentEmployer = Math.round(grossSalary * 0.0405);
  const accidentWork = Math.round(grossSalary * 0.02);
  const familyAllowance = Math.round(grossSalary * 0.0345);
  const fnal = Math.round(grossSalary * 0.001);
  
  const totalEmployerContributions = cnssEmployer + healthEmployer + retirementEmployer + unemploymentEmployer + accidentWork + familyAllowance + fnal;
  
  const netBeforeTax = grossSalary - totalEmployeeDeductions;
  const estimatedTax = Math.round(netBeforeTax * 0.12); // Estimation PAS
  const netAfterTax = netBeforeTax - estimatedTax;

  const [year, month] = payslipData.period.split('-');
  const periodDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const periodLabel = format(periodDate, 'MMMM yyyy', { locale: fr });

  const hireDate = employee.hireDate ? format(new Date(employee.hireDate), 'dd/MM/yyyy') : 'N/A';
  const generatedDate = format(new Date(payslipData.generatedAt), 'dd/MM/yyyy');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie - ${payslipData.employeeName} - ${periodLabel}</title>
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
      border: 2px solid #2563eb;
      padding: 20px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .company-info h1 { 
      color: #2563eb; 
      font-size: 20px; 
      margin-bottom: 5px;
    }
    .company-info p { font-size: 10px; color: #666; }
    .document-title {
      text-align: right;
    }
    .document-title h2 {
      color: #2563eb;
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
      color: #2563eb;
      font-size: 12px;
      margin-bottom: 8px;
      border-bottom: 1px solid #2563eb;
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
      background: #2563eb;
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
    .salary-table .total-row {
      background: #dbeafe;
      font-weight: bold;
      font-size: 11px;
    }
    .salary-table .net-row {
      background: #2563eb;
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
      border: 1px solid #2563eb;
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
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      font-size: 9px;
    }
    .footer-box h4 {
      color: #2563eb;
      margin-bottom: 5px;
      font-size: 10px;
    }
    .legal-notice {
      margin-top: 15px;
      padding: 10px;
      background: #f8fafc;
      border-radius: 5px;
      font-size: 8px;
      color: #666;
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
    <!-- En-tête -->
    <div class="header">
      <div class="company-info">
        <h1>${companyInfo.name}</h1>
        <p>${companyInfo.address}</p>
        <p>Tél: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
        ${companyInfo.siret ? `<p>SIRET: ${companyInfo.siret} | Code NAF: ${companyInfo.naf || 'N/A'}</p>` : ''}
      </div>
      <div class="document-title">
        <h2>BULLETIN DE PAIE</h2>
        <p>Période: ${periodLabel.toUpperCase()}</p>
        <p style="font-size: 10px; color: #666; margin-top: 5px;">Émis le: ${generatedDate}</p>
      </div>
    </div>

    <!-- Informations Employé et Emploi -->
    <div class="info-section">
      <div class="info-box">
        <h3>IDENTIFICATION DU SALARIÉ</h3>
        <table>
          <tr><td>Nom et Prénom:</td><td>${payslipData.employeeName}</td></tr>
          <tr><td>Email:</td><td>${employee.email || 'N/A'}</td></tr>
          <tr><td>Téléphone:</td><td>${employee.phone || 'N/A'}</td></tr>
          <tr><td>N° Sécurité Sociale:</td><td>XXX XXX XXX XXX XX</td></tr>
        </table>
      </div>
      <div class="info-box">
        <h3>SITUATION PROFESSIONNELLE</h3>
        <table>
          <tr><td>Emploi:</td><td>${employee.position}</td></tr>
          <tr><td>Unité:</td><td>${employee.unitName}</td></tr>
          <tr><td>Type de contrat:</td><td>${employee.contractType}</td></tr>
          <tr><td>Date d'embauche:</td><td>${hireDate}</td></tr>
          <tr><td>Convention collective:</td><td>Agriculture/Aquaculture</td></tr>
        </table>
      </div>
    </div>

    <!-- Détail du salaire -->
    <table class="salary-table">
      <thead>
        <tr>
          <th style="width: 40%;">Libellé</th>
          <th style="width: 12%;">Base</th>
          <th style="width: 12%;">Taux Sal.</th>
          <th style="width: 12%;">Montant Sal.</th>
          <th style="width: 12%;">Taux Pat.</th>
          <th style="width: 12%;">Montant Pat.</th>
        </tr>
      </thead>
      <tbody>
        <!-- Rémunération brute -->
        <tr class="section-header">
          <td colspan="6">RÉMUNÉRATION BRUTE</td>
        </tr>
        <tr>
          <td>Salaire de base mensuel</td>
          <td>151,67 h</td>
          <td></td>
          <td>${formatCurrency(payslipData.baseSalary)}</td>
          <td></td>
          <td></td>
        </tr>
        ${payslipData.overtime > 0 ? `
        <tr>
          <td>Heures supplémentaires</td>
          <td></td>
          <td></td>
          <td>${formatCurrency(payslipData.overtime)}</td>
          <td></td>
          <td></td>
        </tr>
        ` : ''}
        ${payslipData.bonuses > 0 ? `
        <tr>
          <td>Primes et gratifications</td>
          <td></td>
          <td></td>
          <td>${formatCurrency(payslipData.bonuses)}</td>
          <td></td>
          <td></td>
        </tr>
        ` : ''}
        <tr class="subtotal">
          <td>TOTAL BRUT</td>
          <td></td>
          <td></td>
          <td>${formatCurrency(grossSalary)}</td>
          <td></td>
          <td></td>
        </tr>

        <!-- Cotisations sociales -->
        <tr class="section-header">
          <td colspan="6">COTISATIONS SOCIALES</td>
        </tr>
        <tr>
          <td>Sécurité sociale - Maladie</td>
          <td>${formatCurrency(grossSalary)}</td>
          <td>0,00%</td>
          <td>0</td>
          <td>12,80%</td>
          <td>${formatCurrency(healthEmployer)}</td>
        </tr>
        <tr>
          <td>Sécurité sociale - Vieillesse (plafonnée)</td>
          <td>${formatCurrency(grossSalary)}</td>
          <td>6,90%</td>
          <td>${formatCurrency(retirementEmployee)}</td>
          <td>8,55%</td>
          <td>${formatCurrency(retirementEmployer)}</td>
        </tr>
        <tr>
          <td>Allocations familiales</td>
          <td>${formatCurrency(grossSalary)}</td>
          <td></td>
          <td></td>
          <td>3,45%</td>
          <td>${formatCurrency(familyAllowance)}</td>
        </tr>
        <tr>
          <td>Assurance chômage</td>
          <td>${formatCurrency(grossSalary)}</td>
          <td>2,40%</td>
          <td>${formatCurrency(unemploymentEmployee)}</td>
          <td>4,05%</td>
          <td>${formatCurrency(unemploymentEmployer)}</td>
        </tr>
        <tr>
          <td>Accident du travail</td>
          <td>${formatCurrency(grossSalary)}</td>
          <td></td>
          <td></td>
          <td>2,00%</td>
          <td>${formatCurrency(accidentWork)}</td>
        </tr>
        <tr>
          <td>CSG déductible</td>
          <td>${formatCurrency(Math.round(grossSalary * 0.9825))}</td>
          <td>6,80%</td>
          <td>${formatCurrency(csgDeductible)}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>CSG non déductible</td>
          <td>${formatCurrency(Math.round(grossSalary * 0.9825))}</td>
          <td>2,40%</td>
          <td>${formatCurrency(csgNonDeductible)}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>CRDS</td>
          <td>${formatCurrency(Math.round(grossSalary * 0.9825))}</td>
          <td>0,50%</td>
          <td>${formatCurrency(crds)}</td>
          <td></td>
          <td></td>
        </tr>
        
        <tr class="subtotal">
          <td>TOTAL COTISATIONS</td>
          <td></td>
          <td></td>
          <td>${formatCurrency(totalEmployeeDeductions)}</td>
          <td></td>
          <td>${formatCurrency(totalEmployerContributions)}</td>
        </tr>

        <!-- Net imposable -->
        <tr class="total-row">
          <td>NET IMPOSABLE</td>
          <td></td>
          <td></td>
          <td colspan="3">${formatCurrency(netBeforeTax)}</td>
        </tr>

        <!-- Prélèvement à la source -->
        <tr class="section-header">
          <td colspan="6">IMPÔT SUR LE REVENU</td>
        </tr>
        <tr>
          <td>Prélèvement à la source (estimation)</td>
          <td>${formatCurrency(netBeforeTax)}</td>
          <td>12,00%</td>
          <td>${formatCurrency(estimatedTax)}</td>
          <td></td>
          <td></td>
        </tr>

        <!-- Net à payer -->
        <tr class="net-row">
          <td>NET À PAYER</td>
          <td></td>
          <td></td>
          <td colspan="3">${formatCurrency(netAfterTax)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Résumé -->
    <div class="summary-section">
      <div class="summary-box employer">
        <h4>💼 Coût total employeur</h4>
        <p class="amount">${formatCurrency(grossSalary + totalEmployerContributions)}</p>
        <p style="font-size: 9px; margin-top: 5px;">
          Salaire brut: ${formatCurrency(grossSalary)}<br>
          Charges patronales: ${formatCurrency(totalEmployerContributions)}
        </p>
      </div>
      <div class="summary-box employee">
        <h4>💰 Net à payer au salarié</h4>
        <p class="amount">${formatCurrency(netAfterTax)}</p>
        <p style="font-size: 9px; margin-top: 5px;">
          Après prélèvement à la source estimé
        </p>
      </div>
    </div>

    <!-- Pied de page -->
    <div class="footer">
      <div class="footer-grid">
        <div class="footer-box">
          <h4>Cumuls annuels</h4>
          <p>Brut cumulé: ${formatCurrency(grossSalary)}</p>
          <p>Net imposable cumulé: ${formatCurrency(netBeforeTax)}</p>
          <p>Heures travaillées: 151,67 h</p>
        </div>
        <div class="footer-box">
          <h4>Congés payés</h4>
          <p>Acquis N-1: 25 jours</p>
          <p>Pris: 0 jours</p>
          <p>Solde: 25 jours</p>
        </div>
        <div class="footer-box">
          <h4>Mode de paiement</h4>
          <p>Virement bancaire</p>
          <p>Date de paiement: Fin du mois</p>
        </div>
      </div>
      
      <div class="legal-notice">
        <strong>Mentions légales:</strong> Ce bulletin de paie doit être conservé sans limitation de durée. 
        En cas de contestation, le salarié dispose d'un délai de 3 ans pour agir devant le Conseil de Prud'hommes.
        Le montant du prélèvement à la source est une estimation basée sur un taux neutre de 12%.
        Pour toute question relative à votre bulletin de paie, contactez le service RH.
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Signature de l'employeur:</strong></p>
          <p style="margin-top: 40px;">Cachet de l'entreprise</p>
        </div>
        <div class="signature-box">
          <p><strong>Signature du salarié:</strong></p>
          <p style="margin-top: 40px;">Lu et approuvé, le ___/___/______</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
