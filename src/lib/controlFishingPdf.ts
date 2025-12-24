// Utilitaire pour générer le PDF des pêches de contrôle

interface ControlFishingRecord {
  id: string;
  date: string;
  cycle_id?: string;
  infrastructure_id?: string;
  infrastructureName?: string;
  cycleName?: string;
  temperature?: number;
  ph?: number;
  oxygen?: number;
  mortality?: number;
  average_weight?: number;
  sample_count?: number;
  notes?: string;
}

interface PrintOptions {
  records: ControlFishingRecord[];
  unitName?: string;
  cycleName?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const generateControlFishingPdf = (options: PrintOptions) => {
  const { records, unitName, cycleName, dateRange } = options;
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour imprimer');
    return;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport Pêches de Contrôle - AQUA PILOT</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #0369a1;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #0369a1;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        .report-title {
          font-size: 22px;
          color: #0c4a6e;
          margin: 20px 0;
        }
        .meta-info {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
          padding: 15px;
          background: #f0f9ff;
          border-radius: 8px;
        }
        .meta-item {
          text-align: left;
        }
        .meta-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
        }
        .meta-value {
          font-size: 14px;
          font-weight: 600;
          color: #0369a1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        th {
          background: #0369a1;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        tr:hover {
          background: #f0f9ff;
        }
        .record-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .record-date {
          font-size: 16px;
          font-weight: 600;
          color: #0369a1;
        }
        .record-infra {
          font-size: 12px;
          color: #666;
        }
        .record-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .record-field {
          text-align: center;
          padding: 8px;
          background: #f8fafc;
          border-radius: 4px;
        }
        .field-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }
        .field-value {
          font-size: 16px;
          font-weight: 600;
          color: #0c4a6e;
        }
        .notes {
          margin-top: 12px;
          padding: 10px;
          background: #fefce8;
          border-radius: 4px;
          font-size: 12px;
          color: #713f12;
        }
        .notes-label {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .summary {
          background: #ecfdf5;
          padding: 20px;
          border-radius: 8px;
          margin-top: 25px;
        }
        .summary-title {
          font-size: 16px;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 15px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #047857;
        }
        .summary-label {
          font-size: 11px;
          color: #065f46;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          .record-card { break-inside: avoid; }
        }
        .print-btn {
          background: #0369a1;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin: 20px auto;
          display: block;
        }
        .print-btn:hover {
          background: #0c4a6e;
        }
      </style>
    </head>
    <body>
      <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / Télécharger PDF</button>
      
      <div class="header">
        <div class="logo">🐟 AQUA PILOT</div>
        <div class="subtitle">Système de Gestion Aquacole</div>
        <h1 class="report-title">Rapport des Pêches de Contrôle</h1>
      </div>

      <div class="meta-info">
        <div class="meta-item">
          <div class="meta-label">Date du rapport</div>
          <div class="meta-value">${formatDate(new Date().toISOString())}</div>
        </div>
        ${unitName ? `
        <div class="meta-item">
          <div class="meta-label">Unité de production</div>
          <div class="meta-value">${unitName}</div>
        </div>
        ` : ''}
        ${cycleName ? `
        <div class="meta-item">
          <div class="meta-label">Cycle de production</div>
          <div class="meta-value">${cycleName}</div>
        </div>
        ` : ''}
        <div class="meta-item">
          <div class="meta-label">Nombre d'enregistrements</div>
          <div class="meta-value">${records.length}</div>
        </div>
        ${dateRange ? `
        <div class="meta-item">
          <div class="meta-label">Période</div>
          <div class="meta-value">${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</div>
        </div>
        ` : ''}
      </div>

      ${records.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: #666;">
          <p>Aucune pêche de contrôle enregistrée pour cette période.</p>
        </div>
      ` : `
        ${records.map(record => `
          <div class="record-card">
            <div class="record-header">
              <div>
                <div class="record-date">${formatDate(record.date)}</div>
                ${record.infrastructureName ? `<div class="record-infra">Infrastructure: ${record.infrastructureName}</div>` : ''}
                ${record.cycleName ? `<div class="record-infra">Cycle: ${record.cycleName}</div>` : ''}
              </div>
            </div>
            <div class="record-grid">
              <div class="record-field">
                <div class="field-label">Température</div>
                <div class="field-value">${record.temperature !== null && record.temperature !== undefined ? record.temperature + '°C' : '-'}</div>
              </div>
              <div class="record-field">
                <div class="field-label">pH</div>
                <div class="field-value">${record.ph !== null && record.ph !== undefined ? record.ph : '-'}</div>
              </div>
              <div class="record-field">
                <div class="field-label">Oxygène</div>
                <div class="field-value">${record.oxygen !== null && record.oxygen !== undefined ? record.oxygen + ' mg/L' : '-'}</div>
              </div>
              <div class="record-field">
                <div class="field-label">Mortalité</div>
                <div class="field-value">${record.mortality !== null && record.mortality !== undefined ? record.mortality : '-'}</div>
              </div>
              <div class="record-field">
                <div class="field-label">Poids moyen</div>
                <div class="field-value">${record.average_weight !== null && record.average_weight !== undefined ? record.average_weight + 'g' : '-'}</div>
              </div>
              <div class="record-field">
                <div class="field-label">Échantillon</div>
                <div class="field-value">${record.sample_count !== null && record.sample_count !== undefined ? record.sample_count + ' ind.' : '-'}</div>
              </div>
            </div>
            ${record.notes ? `
              <div class="notes">
                <div class="notes-label">Observations:</div>
                ${record.notes}
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="summary">
          <div class="summary-title">📊 Résumé Statistique</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${records.length}</div>
              <div class="summary-label">Pêches réalisées</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${records.reduce((sum, r) => sum + (r.sample_count || 0), 0)}</div>
              <div class="summary-label">Total échantillons</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${
                records.filter(r => r.average_weight).length > 0 
                  ? (records.reduce((sum, r) => sum + (r.average_weight || 0), 0) / records.filter(r => r.average_weight).length).toFixed(1) + 'g'
                  : '-'
              }</div>
              <div class="summary-label">Poids moyen global</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${records.reduce((sum, r) => sum + (r.mortality || 0), 0)}</div>
              <div class="summary-label">Mortalité totale</div>
            </div>
          </div>
        </div>
      `}

      <div class="footer">
        <p>Rapport généré automatiquement par AQUA PILOT - ${new Date().toLocaleString('fr-FR')}</p>
        <p>© ${new Date().getFullYear()} AQUA PILOT - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export default generateControlFishingPdf;
