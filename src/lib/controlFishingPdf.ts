import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ControlFishingBatchRow {
  species: string;
  subjectCount: number;
  totalWeight: number; // grammes
  individualWeight: number; // PMI en grammes
}

export interface ControlFishingSpeciesRow {
  species: string;
  subjects: number;
  weight: number; // grammes
  pmi: number;
}

export interface ControlFishingPdfData {
  unitName?: string;
  cycleName?: string;
  infrastructureName?: string;
  date: string;
  availableSubjects: number;
  batches: ControlFishingBatchRow[];
  speciesRows: ControlFishingSpeciesRow[];
  totals: {
    totalSubjects: number;
    totalWeight: number;
    totalWeightKg: number;
    pmi: number;
    samplePercentage: number;
  };
  environment?: {
    temperature?: string;
    ph?: string;
    oxygen?: string;
    mortality?: string;
  };
  notes?: string;
}

const PRIMARY: [number, number, number] = [14, 116, 144];
const LIGHT: [number, number, number] = [240, 249, 255];

const fmt = (n: number, d = 2) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const exportControlFishingPDF = (data: ControlFishingPdfData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // En-tête
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT DE PÊCHE DE CONTRÔLE', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AQUAPILOTE — Suivi de croissance et calcul du PMI', 14, 20);

  doc.setTextColor(40, 40, 40);
  let y = 38;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations générales', 14, y);
  y += 2;

  autoTable(doc, {
    startY: y + 2,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [['Champ', 'Valeur']],
    body: [
      ['Unité de production', data.unitName || '—'],
      ['Cycle', data.cycleName || '—'],
      ['Infrastructure', data.infrastructureName || '—'],
      ['Date de la pêche', new Date(data.date).toLocaleDateString('fr-FR')],
      ['Sujets disponibles', data.availableSubjects.toLocaleString('fr-FR')],
      ['Édité le', new Date().toLocaleString('fr-FR')],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Synthèse globale
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Synthèse globale', 14, y);

  autoTable(doc, {
    startY: y + 2,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5, halign: 'center' },
    headStyles: { fillColor: PRIMARY, textColor: 255, halign: 'center' },
    bodyStyles: { fillColor: LIGHT, fontStyle: 'bold' },
    head: [['Total sujets', 'Poids total', 'PMI global', '% prélevé']],
    body: [[
      data.totals.totalSubjects.toLocaleString('fr-FR'),
      `${fmt(data.totals.totalWeightKg)} kg`,
      `${fmt(data.totals.pmi)} g`,
      `${fmt(data.totals.samplePercentage)} %`,
    ]],
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Détail par lot
  doc.setFont('helvetica', 'bold');
  doc.text('Détail des lots prélevés', 14, y);

  autoTable(doc, {
    startY: y + 2,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [['Lot', 'Espèce', 'Sujets', 'Poids total (g)', 'PMI (g)']],
    body: data.batches.map((b, i) => [
      `Lot ${i + 1}`,
      b.species || 'Non précisée',
      b.subjectCount.toLocaleString('fr-FR'),
      fmt(b.totalWeight, 1),
      fmt(b.individualWeight),
    ]),
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // PMI par espèce
  doc.setFont('helvetica', 'bold');
  doc.text('PMI par espèce', 14, y);

  autoTable(doc, {
    startY: y + 2,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [['Espèce', 'Sujets', 'Poids total (kg)', 'PMI (g)']],
    body: data.speciesRows.map((s) => [
      s.species,
      s.subjects.toLocaleString('fr-FR'),
      fmt(s.weight / 1000),
      fmt(s.pmi),
    ]),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Paramètres environnementaux
  const env = data.environment || {};
  const envRows = [
    ['Température (°C)', env.temperature || '—'],
    ['pH', env.ph || '—'],
    ['Oxygène dissous (mg/L)', env.oxygen || '—'],
    ['Mortalité observée', env.mortality || '—'],
  ];

  doc.setFont('helvetica', 'bold');
  doc.text('Paramètres environnementaux', 14, y);
  autoTable(doc, {
    startY: y + 2,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [['Paramètre', 'Valeur']],
    body: envRows,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (data.notes?.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observations', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.notes.trim(), pageWidth - 28);
    doc.text(lines, 14, y + 6);
    y += 6 + lines.length * 4.5;
  }

  // Méthode de calcul
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(
    'Méthode : PMI (Poids Moyen Individuel) = poids total du lot ÷ nombre de sujets prélevés.',
    14,
    Math.min(y + 6, doc.internal.pageSize.getHeight() - 14),
  );

  // Pieds de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `AQUAPILOTE — Rapport de pêche de contrôle · Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }

  const safeName = (data.infrastructureName || 'peche-controle').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`peche-controle-${safeName}-${data.date}.pdf`);
};
