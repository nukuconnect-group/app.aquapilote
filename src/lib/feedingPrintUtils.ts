import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const generateFeedingRecordHTML = (record: any, unitName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fiche d'Alimentation - ${unitName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #f97316;
          margin: 0;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .section h2 {
          color: #f97316;
          margin-top: 0;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-label {
          font-weight: bold;
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          color: #888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Fiche d'Alimentation</h1>
        <p>Unité: ${unitName}</p>
        <p>Date: ${format(new Date(record.date), 'dd MMMM yyyy', { locale: fr })}</p>
      </div>
      
      <div class="section">
        <h2>Informations générales</h2>
        <div class="info-row">
          <span class="info-label">Date et heure:</span>
          <span>${record.date} à ${record.time || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type d'aliment:</span>
          <span>${record.feed_type || 'N/A'}</span>
        </div>
        ${record.infrastructure_name ? `
        <div class="info-row">
          <span class="info-label">Infrastructure:</span>
          <span>${record.infrastructure_name}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="section">
        <h2>Quantités</h2>
        <div class="info-row">
          <span class="info-label">Quantité servie:</span>
          <span>${record.quantity} kg</span>
        </div>
        ${record.temperature ? `
        <div class="info-row">
          <span class="info-label">Température de l'eau:</span>
          <span>${record.temperature}°C</span>
        </div>
        ` : ''}
      </div>
      
      ${record.behavior ? `
      <div class="section">
        <h2>Observations</h2>
        <div class="info-row">
          <span class="info-label">Comportement:</span>
          <span>${record.behavior}</span>
        </div>
      </div>
      ` : ''}
      
      ${record.notes ? `
      <div class="section">
        <h2>Notes</h2>
        <p>${record.notes}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        <p>AquaPilote - Système de gestion aquacole</p>
      </div>
    </body>
    </html>
  `;
};

export const generateFeedingPlanHTML = (plans: any[], unitName: string) => {
  const activePlans = plans.filter(p => p.is_active);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Planning d'Alimentation - ${unitName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #f97316;
          margin: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #f97316;
          color: white;
          padding: 12px;
          text-align: left;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
          background: #f9f9f9;
        }
        .days {
          font-size: 12px;
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          color: #888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Planning d'Alimentation</h1>
        <p>Unité: ${unitName}</p>
        <p>${activePlans.length} planification(s) active(s)</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Heure</th>
            <th>Type d'aliment</th>
            <th>Quantité</th>
            <th>Jours</th>
          </tr>
        </thead>
        <tbody>
          ${activePlans.map(plan => `
            <tr>
              <td><strong>${plan.time}</strong></td>
              <td>${plan.feed_type}</td>
              <td>${plan.quantity} ${plan.unit}</td>
              <td class="days">${plan.days.join(', ')}</td>
            </tr>
            ${plan.notes ? `
            <tr>
              <td colspan="4" style="padding-left: 30px; font-size: 12px; color: #666;">
                Note: ${plan.notes}
              </td>
            </tr>
            ` : ''}
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        <p>AquaPilote - Système de gestion aquacole</p>
      </div>
    </body>
    </html>
  `;
};

export const printHTML = (html: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const downloadHTML = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
