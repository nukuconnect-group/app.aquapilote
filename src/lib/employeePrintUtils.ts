import { Employee } from '@/hooks/useEmployees';

export const generateEmployeeListHTML = (
  employees: Employee[], 
  companyName: string,
  unitName?: string,
  formatCurrency?: (value: number) => string
) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatMoney = formatCurrency || ((v: number) => `${v.toLocaleString()} FCFA`);

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const activeCount = employees.filter(e => e.status === 'active').length;

  const getContractColor = (type: string) => {
    switch (type) {
      case 'CDI': return '#22c55e';
      case 'CDD': return '#3b82f6';
      case 'Stage': return '#f59e0b';
      case 'Freelance': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Actif', color: '#22c55e' };
      case 'inactive': return { label: 'Inactif', color: '#ef4444' };
      case 'vacation': return { label: 'En congés', color: '#f59e0b' };
      default: return { label: status, color: '#6b7280' };
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Liste des Employés - ${companyName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f8fafc;
          color: #1e293b;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 30px 40px;
          border-radius: 16px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
        }
        
        .header p {
          opacity: 0.9;
          margin-top: 5px;
        }
        
        .header-right {
          text-align: right;
        }
        
        .header-right .date {
          font-size: 14px;
          opacity: 0.8;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .stat-card .value {
          font-size: 28px;
          font-weight: 700;
          color: #0ea5e9;
        }
        
        .stat-card .label {
          font-size: 14px;
          color: #64748b;
          margin-top: 5px;
        }
        
        .employees-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .table-header {
          background: #f1f5f9;
          padding: 15px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table-header h2 {
          font-size: 18px;
          font-weight: 600;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f8fafc;
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        tr:hover {
          background: #f8fafc;
        }
        
        .employee-name {
          font-weight: 600;
          color: #1e293b;
        }
        
        .employee-email {
          font-size: 12px;
          color: #64748b;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .salary {
          font-weight: 600;
          color: #0f766e;
        }
        
        .footer {
          margin-top: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }
        
        @media print {
          body { background: white; }
          .container { padding: 20px; }
          .header { break-after: avoid; }
          .stats-grid { break-inside: avoid; }
          tr { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>📋 Liste des Employés</h1>
            <p>${companyName}${unitName ? ` - ${unitName}` : ''}</p>
          </div>
          <div class="header-right">
            <div class="date">${today}</div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="value">${employees.length}</div>
            <div class="label">Total Employés</div>
          </div>
          <div class="stat-card">
            <div class="value">${activeCount}</div>
            <div class="label">Employés Actifs</div>
          </div>
          <div class="stat-card">
            <div class="value">${formatMoney(totalSalary)}</div>
            <div class="label">Masse Salariale</div>
          </div>
          <div class="stat-card">
            <div class="value">${employees.length > 0 ? formatMoney(Math.round(totalSalary / employees.length)) : '0'}</div>
            <div class="label">Salaire Moyen</div>
          </div>
        </div>
        
        <div class="employees-table">
          <div class="table-header">
            <h2>Détail des Employés</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Employé</th>
                <th>Poste</th>
                <th>Unité</th>
                <th>Contrat</th>
                <th>Statut</th>
                <th>Date d'embauche</th>
                <th>Salaire</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map((emp, index) => {
                const status = getStatusLabel(emp.status);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      <div class="employee-name">${emp.firstName} ${emp.lastName}</div>
                      <div class="employee-email">${emp.email || '-'}</div>
                    </td>
                    <td>${emp.position || '-'}</td>
                    <td>${emp.unitName || '-'}</td>
                    <td>
                      <span class="badge" style="background: ${getContractColor(emp.contractType)}15; color: ${getContractColor(emp.contractType)}">
                        ${emp.contractType}
                      </span>
                    </td>
                    <td>
                      <span class="badge" style="background: ${status.color}15; color: ${status.color}">
                        ${status.label}
                      </span>
                    </td>
                    <td>${emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : '-'}</td>
                    <td class="salary">${formatMoney(emp.salary)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Document généré le ${today} par AquaPilote</p>
          <p>© ${new Date().getFullYear()} ${companyName} - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printEmployeeList = (
  employees: Employee[], 
  companyName: string,
  unitName?: string,
  formatCurrency?: (value: number) => string
) => {
  const html = generateEmployeeListHTML(employees, companyName, unitName, formatCurrency);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
