import { describe, it, expect } from 'vitest';
import { generateNextDocumentNumber } from '../salesDocumentUtils';

describe('generateNextDocumentNumber', () => {
  it('should generate a receipt number', () => {
    const sales = [];
    const number = generateNextDocumentNumber('receipt', sales);
    const year = new Date().getFullYear();
    expect(number).toBe(`REC-${year}-0001`);
  });

  it('should generate an invoice number', () => {
    const sales = [];
    const number = generateNextDocumentNumber('invoice', sales);
    const year = new Date().getFullYear();
    expect(number).toBe(`FAC-${year}-0001`);
  });

  it('should generate a proforma number', () => {
    const sales = [];
    const number = generateNextDocumentNumber('proforma', sales);
    const year = new Date().getFullYear();
    expect(number).toBe(`PRO-${year}-0001`);
  });

  it('should avoid duplicates', () => {
    const year = new Date().getFullYear();
    const sales = [
      { documentType: 'invoice' as const, documentNumber: `FAC-${year}-0001` }
    ];
    const number = generateNextDocumentNumber('invoice', sales);
    expect(number).toBe(`FAC-${year}-0002`);
  });
});
