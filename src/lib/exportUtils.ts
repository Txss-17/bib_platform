// Export utilities for CSV and PDF generation with boutique branding + Verified by Linksy

interface ExportColumn {
  header: string;
  accessor: (row: any) => string;
}

interface ExportOptions {
  boutiqueName?: string;
  boutiqueLogo?: string | null;
}

export function exportToCSV(data: any[], columns: ExportColumn[], filename: string, options?: ExportOptions) {
  const headerLines: string[] = [];
  if (options?.boutiqueName) {
    headerLines.push(`"${options.boutiqueName} — Verified by Linksy"`);
    headerLines.push(`"Exporté le ${new Date().toLocaleDateString('fr-FR')}"`);
    headerLines.push("");
  }
  const headers = columns.map(c => c.header);
  const rows = data.map(row => columns.map(c => c.accessor(row)));
  const csv = [...headerLines, [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}-${dateStamp()}.csv`);
}

export function exportToPDF(data: any[], columns: ExportColumn[], title: string, filename: string, options?: ExportOptions) {
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 40;
  const headerHeight = 70;
  const rowHeight = 22;
  const colWidth = (pageWidth - 2 * margin) / columns.length;
  const maxRowsPerPage = Math.floor((pageHeight - margin - headerHeight - 60) / rowHeight);

  const boutiqueName = options?.boutiqueName || "Brand-In-A-Box";
  const pages: string[] = [];
  const totalPages = Math.ceil(data.length / maxRowsPerPage) || 1;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageData = data.slice(pageIdx * maxRowsPerPage, (pageIdx + 1) * maxRowsPerPage);
    let content = '';

    // Header with boutique name + Verified by Linksy
    content += `
      <text x="${margin}" y="30" fill="#111827" font-family="Arial,sans-serif" font-size="16" font-weight="bold">${escapeXml(boutiqueName)}</text>
      <text x="${margin}" y="46" fill="#7c3aed" font-family="Arial,sans-serif" font-size="9" font-style="italic">✓ Verified by Linksy</text>
      <text x="${pageWidth / 2}" y="34" text-anchor="middle" fill="#374151" font-family="Arial,sans-serif" font-size="14" font-weight="bold">${escapeXml(title)}</text>
      <text x="${pageWidth - margin}" y="34" text-anchor="end" fill="#9ca3af" font-family="Arial,sans-serif" font-size="10">${new Date().toLocaleDateString('fr-FR')} — Page ${pageIdx + 1}/${totalPages}</text>
      <line x1="${margin}" y1="52" x2="${pageWidth - margin}" y2="52" stroke="#e5e7eb" stroke-width="1"/>
    `;

    // Table header
    const tableTop = headerHeight;
    columns.forEach((col, i) => {
      content += `
        <rect x="${margin + i * colWidth}" y="${tableTop}" width="${colWidth}" height="${rowHeight}" fill="#f3f4f6"/>
        <text x="${margin + i * colWidth + 6}" y="${tableTop + 15}" fill="#374151" font-family="Arial,sans-serif" font-size="9" font-weight="bold">${escapeXml(col.header)}</text>
      `;
    });

    // Table rows
    pageData.forEach((row, rIdx) => {
      const y = tableTop + (rIdx + 1) * rowHeight;
      const bgFill = rIdx % 2 === 0 ? '#ffffff' : '#f9fafb';
      columns.forEach((col, cIdx) => {
        const val = col.accessor(row);
        content += `
          <rect x="${margin + cIdx * colWidth}" y="${y}" width="${colWidth}" height="${rowHeight}" fill="${bgFill}"/>
          <text x="${margin + cIdx * colWidth + 6}" y="${y + 15}" fill="#111827" font-family="Arial,sans-serif" font-size="8.5">${escapeXml(truncate(val, 30))}</text>
        `;
      });
      content += `<line x1="${margin}" y1="${y + rowHeight}" x2="${pageWidth - margin}" y2="${y + rowHeight}" stroke="#e5e7eb" stroke-width="0.5"/>`;
    });

    // Footer
    content += `
      <text x="${pageWidth / 2}" y="${pageHeight - 15}" text-anchor="middle" fill="#9ca3af" font-family="Arial,sans-serif" font-size="8">${escapeXml(boutiqueName)} — Verified by Linksy — ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</text>
    `;

    pages.push(content);
  }

  const svgPages = pages.map(p => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">
      <rect width="${pageWidth}" height="${pageHeight}" fill="white"/>
      ${p}
    </svg>
  `);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeXml(title)}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { margin: 0; }
  .page { page-break-after: always; width: 842px; height: 595px; }
  .page:last-child { page-break-after: avoid; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
${svgPages.map(s => `<div class="page">${s}</div>`).join('')}
<script>window.onload=()=>{ window.print(); }</script>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) {
    downloadBlob(blob, `${filename}-${dateStamp()}.html`);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '…' : s;
}
