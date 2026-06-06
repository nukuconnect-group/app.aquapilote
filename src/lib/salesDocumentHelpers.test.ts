import { describe, expect, it } from 'vitest';
import { generateNextDocumentNumber } from '@/lib/salesDocumentHelpers';

describe('salesDocumentHelpers', () => {
  it('génère un numéro REC avec le bon préfixe', () => {
    const result = generateNextDocumentNumber([], 'receipt', new Date('2026-01-10'));
    expect(result).toBe('REC-2026-0001');
  });

  it('génère un numéro FAC en évitant les doublons', () => {
    const result = generateNextDocumentNumber(
      [
        { documentType: 'invoice', documentNumber: 'FAC-2026-0001' },
        { documentType: 'invoice', documentNumber: 'FAC-2026-0002' },
      ],
      'invoice',
      new Date('2026-01-10'),
    );
    expect(result).toBe('FAC-2026-0003');
  });

  it('génère un numéro PRO pour les proformas', () => {
    const result = generateNextDocumentNumber([], 'proforma', new Date('2026-01-10'));
    expect(result).toBe('PRO-2026-0001');
  });
});