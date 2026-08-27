/**
 * Utility functions for exporting tables to PDF, Excel, and Print
 */

const sanitizeForPDF = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/₹/g, 'Rs. ');
};

export const exportToPDF = async ({ fileName, title, subtitle, headers, rows, meta = [] }) => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [37, 99, 235]; // #2563eb
    const darkTextColor = [30, 41, 59]; // #1e293b
    const mutedTextColor = [100, 116, 139]; // #64748b

    // 1. Header Banner
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 22, 'F');

    // Company / Portal Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPERVISOR FIELD PORTAL', 14, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Aarya Innovtech - Site Operations & Expenditure System', 14, 17);

    // Date Generated
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(7.5);
    doc.text(`Generated: ${dateStr}`, 196, 14, { align: 'right' });

    // 2. Document Title
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeForPDF(title || 'Statement Report'), 14, 32);

    if (subtitle) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
      doc.text(sanitizeForPDF(subtitle), 14, 37);
    }

    // 3. Summary Badges/Boxes (Replaces ₹ with clean Rs. to prevent PDF font corruption)
    let startY = subtitle ? 43 : 38;
    if (meta && meta.length > 0) {
      const boxWidth = (182 - (meta.length - 1) * 3.5) / meta.length;
      meta.forEach((item, index) => {
        const x = 14 + index * (boxWidth + 3.5);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, startY, boxWidth, 14, 1.5, 1.5, 'FD');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
        doc.text(sanitizeForPDF(item.label).toUpperCase(), x + 2.5, startY + 4.8);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(sanitizeForPDF(item.value), x + 2.5, startY + 10.5);
      });
      startY += 18;
    }

    // 4. Data Table Clean Sanitization
    const cleanHeaders = headers.map(h => sanitizeForPDF(h));
    const cleanRows = rows.map(r => r.map(cell => sanitizeForPDF(cell)));

    const tableOptions = {
      startY: startY,
      head: [cleanHeaders],
      body: cleanRows,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2.8
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
        cellPadding: 2.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, 105, 288, { align: 'center' });
        doc.text('Confidential - For Internal Site Operations & Audit Only', 14, 288);
      }
    };

    if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableOptions);
    }

    // Direct file download
    doc.save(`${fileName || 'Statement'}.pdf`);
  } catch (err) {
    console.error('Error creating PDF, triggering print dialog as fallback:', err);
    window.print();
  }
};

/**
 * Direct Excel / CSV Download
 */
export const exportToExcel = (fileName, headers, rows) => {
  let csvContent = '\uFEFF'; // UTF-8 BOM
  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';
  
  rows.forEach(row => {
    const rowContent = row.map(cell => {
      const cellStr = cell !== null && cell !== undefined ? String(cell) : '';
      return `"${cellStr.replace(/"/g, '""')}"`;
    }).join(',');
    csvContent += rowContent + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Browser Print Trigger
 */
export const triggerPrint = () => {
  window.print();
};

export const triggerPDF = () => {
  window.print();
};
