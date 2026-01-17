/**
 * Utilitaires pour l'export des rapports en différents formats
 */

import { CompanyInfoForPrint, generateCompanyHeaderHTML } from './companyHeaderUtils';

/**
 * Escape HTML special characters to prevent XSS attacks
 */
const escapeHtml = (unsafe: string | number | null | undefined): string => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  unitName?: string;
  sections: ReportSection[];
  companyInfo?: CompanyInfoForPrint;
}

export interface ReportSection {
  title: string;
  type: 'table' | 'summary' | 'chart-data';
  headers?: string[];
  rows?: (string | number)[][];
  summary?: { label: string; value: string | number }[];
}

/**
 * Génère un fichier CSV à partir des données
 */
export const exportToCSV = (data: ReportData, filename: string) => {
  let csvContent = '';
  
  // En-tête entreprise
  if (data.companyInfo?.name) {
    csvContent += `"${data.companyInfo.name}"\n`;
    if (data.companyInfo.address) csvContent += `"${data.companyInfo.address}"\n`;
    if (data.companyInfo.phone || data.companyInfo.email) {
      csvContent += `"${data.companyInfo.phone || ''} ${data.companyInfo.email || ''}"\n`;
    }
    csvContent += '\n';
  }
  
  // En-tête du rapport
  csvContent += `"${data.title}"\n`;
  csvContent += `"Période: ${data.period}"\n`;
  csvContent += `"Généré le: ${data.generatedAt}"\n`;
  if (data.unitName) {
    csvContent += `"Unité: ${data.unitName}"\n`;
  }
  csvContent += '\n';

  // Sections
  data.sections.forEach(section => {
    csvContent += `"${section.title}"\n`;
    
    if (section.type === 'table' && section.headers && section.rows) {
      csvContent += section.headers.map(h => `"${h}"`).join(',') + '\n';
      section.rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    } else if (section.type === 'summary' && section.summary) {
      section.summary.forEach(item => {
        csvContent += `"${item.label}","${item.value}"\n`;
      });
    }
    csvContent += '\n';
  });

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Génère un fichier Excel (format TSV compatible)
 */
export const exportToExcel = (data: ReportData, filename: string) => {
  let content = '';
  
  // En-tête entreprise
  if (data.companyInfo?.name) {
    content += `${data.companyInfo.name}\n`;
    if (data.companyInfo.address) content += `${data.companyInfo.address}\n`;
    if (data.companyInfo.phone || data.companyInfo.email) {
      content += `${data.companyInfo.phone || ''}\t${data.companyInfo.email || ''}\n`;
    }
    content += '\n';
  }
  
  // En-tête du rapport
  content += `${data.title}\n`;
  content += `Période: ${data.period}\n`;
  content += `Généré le: ${data.generatedAt}\n`;
  if (data.unitName) {
    content += `Unité: ${data.unitName}\n`;
  }
  content += '\n';

  // Sections
  data.sections.forEach(section => {
    content += `${section.title}\n`;
    
    if (section.type === 'table' && section.headers && section.rows) {
      content += section.headers.join('\t') + '\n';
      section.rows.forEach(row => {
        content += row.join('\t') + '\n';
      });
    } else if (section.type === 'summary' && section.summary) {
      section.summary.forEach(item => {
        content += `${item.label}\t${item.value}\n`;
      });
    }
    content += '\n';
  });

  // Export as .xls with tab separator (Excel compatible)
  downloadFile(content, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
};

/**
 * Génère un fichier Word (format HTML compatible)
 */
export const exportToWord = (data: ReportData, filename: string) => {
  // Générer l'en-tête entreprise HTML
  const companyHeader = data.companyInfo ? generateCompanyHeaderHTML(data.companyInfo) : '';
  
  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(data.title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
        h2 { color: #2c5282; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #cbd5e0; padding: 10px; text-align: left; }
        th { background-color: #e2e8f0; font-weight: bold; }
        .summary-item { margin: 8px 0; }
        .summary-label { font-weight: bold; color: #4a5568; }
        .summary-value { color: #2d3748; }
        .header-info { color: #718096; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      ${companyHeader}
      <h1>${escapeHtml(data.title)}</h1>
      <p class="header-info"><strong>Période:</strong> ${escapeHtml(data.period)}</p>
      <p class="header-info"><strong>Généré le:</strong> ${escapeHtml(data.generatedAt)}</p>
      ${data.unitName ? `<p class="header-info"><strong>Unité:</strong> ${escapeHtml(data.unitName)}</p>` : ''}
  `;

  data.sections.forEach(section => {
    htmlContent += `<h2>${escapeHtml(section.title)}</h2>`;
    
    if (section.type === 'table' && section.headers && section.rows) {
      htmlContent += '<table>';
      htmlContent += '<tr>' + section.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';
      section.rows.forEach(row => {
        htmlContent += '<tr>' + row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>';
      });
      htmlContent += '</table>';
    } else if (section.type === 'summary' && section.summary) {
      section.summary.forEach(item => {
        htmlContent += `<div class="summary-item"><span class="summary-label">${escapeHtml(item.label)}:</span> <span class="summary-value">${escapeHtml(item.value)}</span></div>`;
      });
    }
  });

  htmlContent += '</body></html>';

  downloadFile(htmlContent, `${filename}.doc`, 'application/msword;charset=utf-8;');
};

/**
 * Génère un fichier PDF (via impression navigateur)
 */
export const exportToPDF = (data: ReportData, filename: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour générer le PDF');
    return;
  }

  // Générer l'en-tête entreprise HTML
  const companyHeader = data.companyInfo ? generateCompanyHeaderHTML(data.companyInfo) : '';

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(data.title)}</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
        }
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 15px; margin-bottom: 20px; }
        h2 { color: #2c5282; margin-top: 30px; border-left: 4px solid #3182ce; padding-left: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #cbd5e0; padding: 12px; text-align: left; }
        th { background-color: #3182ce; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f7fafc; }
        .summary-item { margin: 10px 0; padding: 8px; background-color: #f7fafc; border-radius: 4px; }
        .summary-label { font-weight: bold; color: #2d3748; }
        .summary-value { color: #3182ce; font-size: 1.1em; }
        .header-info { color: #718096; margin-bottom: 8px; font-size: 0.95em; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 0.85em; text-align: center; }
      </style>
    </head>
    <body>
      ${companyHeader}
      <h1>${escapeHtml(data.title)}</h1>
      <p class="header-info"><strong>Période:</strong> ${escapeHtml(data.period)}</p>
      <p class="header-info"><strong>Date de génération:</strong> ${escapeHtml(data.generatedAt)}</p>
      ${data.unitName ? `<p class="header-info"><strong>Unité de production:</strong> ${escapeHtml(data.unitName)}</p>` : ''}
  `;

  data.sections.forEach(section => {
    htmlContent += `<h2>${escapeHtml(section.title)}</h2>`;
    
    if (section.type === 'table' && section.headers && section.rows) {
      htmlContent += '<table>';
      htmlContent += '<tr>' + section.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';
      section.rows.forEach(row => {
        htmlContent += '<tr>' + row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>';
      });
      htmlContent += '</table>';
    } else if (section.type === 'summary' && section.summary) {
      section.summary.forEach(item => {
        htmlContent += `<div class="summary-item"><span class="summary-label">${escapeHtml(item.label)}:</span> <span class="summary-value">${escapeHtml(item.value)}</span></div>`;
      });
    }
  });

  htmlContent += `
      <div class="footer">
        <p>Rapport généré automatiquement par AquaPilot - ${escapeHtml(data.generatedAt)}</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Télécharge un fichier
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formate une date pour le nom de fichier
 */
export const getReportFilename = (reportType: string, unitName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const unit = unitName ? `_${unitName.replace(/\s+/g, '-')}` : '';
  return `rapport-${reportType}${unit}_${date}`;
};

/**
 * Formate un montant en devise
 */
export const formatAmount = (amount: number, currency: string = 'XOF'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' F CFA';
};
