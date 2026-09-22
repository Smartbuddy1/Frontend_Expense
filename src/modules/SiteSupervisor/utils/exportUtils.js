/**
 * Utility functions for exporting tables to PDF, Excel, and Print
 */

const sanitizeForPDF = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/₹/g, 'Rs. ');
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, addPdfSignatures } from '../../Operations/utils/pdfHeaderHelper';

export const exportToPDF = async ({ fileName, title, subtitle, headers, rows, meta = [] }) => {
  try {

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const startY = await addPdfHeaderWithLogo(doc, title || 'Statement Report', subtitle || `Generated: ${new Date().toLocaleString()}`);

    // Data Table Clean Sanitization
    const cleanHeaders = headers.map(h => sanitizeForPDF(h));
    const cleanRows = rows.map(r => r.map(cell => sanitizeForPDF(cell)));

    const tableOptions = {
      startY: startY + 2,
      head: [cleanHeaders],
      body: cleanRows,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        lineColor: [37, 99, 235],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableOptions);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableOptions);
    } else {
      console.warn("PDF autoTable failed, using fallback");
    }

    await addPdfFooterWithLogo(doc);
    addPdfSignatures(doc);

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
