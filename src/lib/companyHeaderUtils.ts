/**
 * Utilitaires pour générer les en-têtes entreprise sur tous les documents imprimables
 */

export interface CompanyInfoForPrint {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  registrationNumber?: string;
  taxId?: string;
  stampUrl?: string;
  signatureUrl?: string;
  cifNif?: string;
  rccm?: string;
  website?: string;
  legalRepresentative?: string;
  hideStampOnDocuments?: boolean;
}

/**
 * Génère le HTML de l'en-tête entreprise pour les documents imprimables
 */
export const generateCompanyHeaderHTML = (companyInfo: CompanyInfoForPrint): string => {
  if (!companyInfo.name) {
    return '';
  }

  const idLine: string[] = [];
  if (companyInfo.registrationNumber) idLine.push(`N° Reg: ${companyInfo.registrationNumber}`);
  if (companyInfo.rccm) idLine.push(`RCCM: ${companyInfo.rccm}`);
  if (companyInfo.cifNif) idLine.push(`CIF/NIF: ${companyInfo.cifNif}`);
  if (companyInfo.taxId) idLine.push(`ID Fiscal: ${companyInfo.taxId}`);
  if (companyInfo.website) idLine.push(`Web: ${companyInfo.website}`);
  if (companyInfo.legalRepresentative) idLine.push(`Resp.: ${companyInfo.legalRepresentative}`);

  return `
    <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; border-left: 4px solid #2563eb;">
      <div style="display: flex; align-items: center; gap: 20px;">
        ${companyInfo.logoUrl ? `
          <div style="flex-shrink: 0;">
            <img src="${companyInfo.logoUrl}" alt="Logo" style="max-height: 70px; max-width: 150px; object-fit: contain;" />
          </div>
        ` : ''}
        <div style="flex: 1;">
          <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1e293b; font-weight: bold;">${companyInfo.name}</h2>
          ${companyInfo.address ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${companyInfo.address}</p>` : ''}
          <div style="font-size: 12px; color: #64748b;">
            ${companyInfo.phone ? `<span>Tél: ${companyInfo.phone}</span>` : ''}
            ${companyInfo.phone && companyInfo.email ? ' | ' : ''}
            ${companyInfo.email ? `<span>Email: ${companyInfo.email}</span>` : ''}
          </div>
          ${idLine.length ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${idLine.join(' | ')}</div>` : ''}
        </div>
      </div>
    </div>
  `;
};

/**
 * Génère un pied de page avec cachet et signature pour les documents officiels
 */
export const generateCompanyFooterHTML = (companyInfo: CompanyInfoForPrint): string => {
  const showStamp = companyInfo.stampUrl && !companyInfo.hideStampOnDocuments;
  if (!showStamp && !companyInfo.signatureUrl) return '';
  return `
    <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; gap: 40px;">
      ${companyInfo.signatureUrl ? `
        <div style="text-align: center; flex: 1;">
          <img src="${companyInfo.signatureUrl}" alt="Signature" style="max-height: 80px; max-width: 200px; object-fit: contain;" />
          <div style="border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 4px; font-size: 11px; color: #64748b;">
            Signature${companyInfo.legalRepresentative ? ' - ' + companyInfo.legalRepresentative : ''}
          </div>
        </div>
      ` : '<div style="flex:1;"></div>'}
      ${showStamp ? `
        <div style="text-align: center; flex: 1;">
          <img src="${companyInfo.stampUrl}" alt="Cachet" style="max-height: 100px; max-width: 200px; object-fit: contain;" />
          <div style="border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 4px; font-size: 11px; color: #64748b;">
            Cachet de l'entreprise
          </div>
        </div>
      ` : '<div style="flex:1;"></div>'}
    </div>
  `;
};

/**
 * Génère le CSS pour l'en-tête entreprise
 */
export const getCompanyHeaderCSS = (): string => {
  return `
    .company-header {
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .company-header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .company-logo {
      max-height: 70px;
      max-width: 150px;
      object-fit: contain;
    }
    .company-name {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #1e293b;
      font-weight: bold;
    }
    .company-address {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #475569;
    }
    .company-contact {
      font-size: 12px;
      color: #64748b;
    }
    .company-registration {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }
  `;
};

/**
 * Génère l'en-tête minimaliste pour l'impression
 */
export const generateMinimalCompanyHeader = (companyInfo: CompanyInfoForPrint): string => {
  if (!companyInfo.name) {
    return '<h2 style="color: #2563eb; margin-bottom: 20px;">AQUA PILOTE</h2>';
  }

  return `
    <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #2563eb;">
      <h1 style="color: #2563eb; font-size: 24px; margin: 0 0 5px 0;">${companyInfo.name}</h1>
      ${companyInfo.address ? `<p style="margin: 0; font-size: 12px; color: #64748b;">${companyInfo.address}</p>` : ''}
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8;">
        ${companyInfo.phone ? `Tél: ${companyInfo.phone}` : ''}
        ${companyInfo.phone && companyInfo.email ? ' | ' : ''}
        ${companyInfo.email ? `Email: ${companyInfo.email}` : ''}
      </p>
    </div>
  `;
};
