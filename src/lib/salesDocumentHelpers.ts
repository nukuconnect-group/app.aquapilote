import type { Sale } from '@/hooks/useSales';

export type SalesDocumentType = 'receipt' | 'invoice' | 'proforma';

export interface SalesDraftItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesDraft {
  clientName: string;
  clientContact: string;
  unitId: string;
  products: SalesDraftItem[];
  paymentMethod: string;
  notes: string;
  isCredit: boolean;
  dueDate: string;
  paymentTerms: string;
  documentType: SalesDocumentType;
  taxRate: number;
  legalMentions?: string;
}

export interface SalesDocumentValidationResult {
  valid: boolean;
  errors: string[];
}

export const getDocumentPrefix = (type: SalesDocumentType): 'REC' | 'FAC' | 'PRO' => {
  if (type === 'invoice') return 'FAC';
  if (type === 'proforma') return 'PRO';
  return 'REC';
};

export const buildDocumentNumber = (
  type: SalesDocumentType,
  year: number,
  seq: number,
): string => `${getDocumentPrefix(type)}-${year}-${String(seq).padStart(4, '0')}`;

export const generateNextDocumentNumber = (
  sales: Pick<Sale, 'documentType' | 'documentNumber'>[],
  type: SalesDocumentType,
  now = new Date(),
): string => {
  const year = now.getFullYear();
  const used = new Set(
    sales
      .filter((sale) => (sale.documentType ?? 'receipt') === type && sale.documentNumber)
      .map((sale) => sale.documentNumber as string),
  );

  let seq = sales.filter((sale) => (sale.documentType ?? 'receipt') === type).length + 1;
  let candidate = '';
  do {
    candidate = buildDocumentNumber(type, year, seq);
    seq += 1;
  } while (used.has(candidate));

  return candidate;
};

export const getDefaultLegalMentions = (type: SalesDocumentType): string => {
  if (type === 'invoice') {
    return 'Facture émise conformément à la législation en vigueur. Pénalités applicables en cas de retard de paiement.';
  }

  if (type === 'proforma') {
    return 'Facture proforma fournie à titre estimatif. Ce document ne vaut pas preuve de paiement ni facture fiscale.';
  }

  return 'Ce reçu confirme un paiement encaissé. Il ne vaut pas facture fiscale.';
};

const hasValidProducts = (products: SalesDraftItem[]) =>
  products.length > 0 &&
  products.every(
    (product) => product.name.trim().length > 0 && product.quantity > 0 && product.unitPrice > 0,
  );

export const validateSalesDocumentDraft = (
  draft: SalesDraft,
): SalesDocumentValidationResult => {
  const errors: string[] = [];

  if (!draft.clientName.trim()) errors.push('Le nom du client est obligatoire.');
  if (!draft.unitId) errors.push("L'unité de production est obligatoire.");
  if (!hasValidProducts(draft.products)) {
    errors.push('Ajoutez au moins un produit valide avec quantité et prix unitaire.');
  }

  if (draft.documentType === 'invoice') {
    if (Number.isNaN(draft.taxRate) || draft.taxRate < 0) {
      errors.push('Le taux de TVA est obligatoire pour une facture.');
    }
    if (!draft.dueDate) errors.push("La date d'échéance est obligatoire pour une facture.");
    if (!draft.legalMentions?.trim()) {
      errors.push('Les mentions légales sont obligatoires pour une facture.');
    }
  }

  if (draft.documentType === 'proforma' && !draft.legalMentions?.trim()) {
    errors.push('Les mentions proforma sont obligatoires.');
  }

  if (draft.isCredit) {
    if (!draft.dueDate) errors.push("Une vente à crédit doit avoir une échéance.");
    if (!draft.paymentTerms) errors.push('Les conditions de paiement sont obligatoires pour un crédit.');
  }

  return { valid: errors.length === 0, errors };
};