import type { Sale } from '@/hooks/useSales';

export interface CompanyDocumentInfo {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
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