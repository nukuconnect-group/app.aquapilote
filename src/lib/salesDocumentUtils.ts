import type { Sale } from '@/hooks/useSales';

export interface CompanyDocumentInfo {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export const buildCompanyContactText = (companyInfo: CompanyDocumentInfo): string | undefined => {
  if (companyInfo.phone && companyInfo.email) {
    return `Tél: ${companyInfo.phone} | Email: ${companyInfo.email}`;
  }

  if (companyInfo.phone) {
    return `Tél: ${companyInfo.phone}`;
  }

  if (companyInfo.email) {
    return `Email: ${companyInfo.email}`;
  }

  return undefined;
};

export const getCompanyDocumentFields = (companyInfo: CompanyDocumentInfo) => ({
  companyName: companyInfo.name || undefined,
  companyAddress: companyInfo.address || undefined,
  companyContact: buildCompanyContactText(companyInfo),
  companyLogo: companyInfo.logoUrl || undefined,
});

export const isSaleSettled = (
  sale: Pick<Sale, 'status' | 'isCredit' | 'paidAmount' | 'totalAmount'>,
): boolean => {
  if (sale.status === 'paid') {
    return true;
  }

  if (sale.isCredit === false) {
    return true;
  }

  return (sale.paidAmount || 0) >= sale.totalAmount;
};
export const generateNextDocumentNumber = (
  type: 'receipt' | 'invoice' | 'proforma',
  existingSales: Pick<Sale, 'documentType' | 'documentNumber'>[]
): string => {
  const prefix = type === 'invoice' ? 'FAC' : (type === 'proforma' ? 'PRO' : 'REC');
  const year = new Date().getFullYear();
  const used = new Set(
    existingSales
      .filter((s) => (s.documentType ?? 'receipt') === type && s.documentNumber)
      .map((s) => s.documentNumber as string)
  );
  let seq = existingSales.filter((s) => (s.documentType ?? 'receipt') === type).length + 1;
  let candidate = '';
  do {
    candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
    seq += 1;
  } while (used.has(candidate));
  return candidate;
};
