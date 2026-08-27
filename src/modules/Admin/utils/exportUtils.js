import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeaderWithLogo, addPdfFooterWithPageNumbers } from './pdfHeaderHelper';

/**
 * Ultra-Clear Executive PDF Exporter with Official Aarya Innovtech Logo & Header Banner
 */
export const exportToPDF = async (title, columns, rows, subtitle = '', customOrientation = null) => {
  try {
    // Choose landscape orientation if 5 or more columns to ensure maximum clarity & wide columns
    const isLandscape = customOrientation ? customOrientation === 'landscape' : columns.length >= 5;
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const sub = subtitle || `Aarya Site Expense Management System (ASEMS) • Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    
    // Add Official Aarya Innovtech Logo & Header Banner
    const startY = await addPdfHeaderWithLogo(doc, title, sub);

    // Clean rows and replace Unicode ₹ with 'Rs. ' to prevent font glyph corruption in jsPDF
    const safeRows = rows.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) return '-';
        return cell.toString().replace(/₹\s?/g, 'Rs. ');
      })
    );

    const safeColumns = columns.map(c => c.toString().replace(/₹\s?/g, 'Rs. '));

    const tableOptions = {
      head: [safeColumns],
      body: safeRows,
      startY: startY || 30,
      theme: 'grid',
      styles: { 
        fontSize: isLandscape ? 9.5 : 8.5,
        cellPadding: isLandscape ? { top: 3.5, right: 3, bottom: 3.5, left: 3 } : 3,
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
        font: 'helvetica',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: isLandscape ? 9.5 : 8.5,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer: Page Number & Confidentiality Note
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Confidential • AI AARYA INNOVTECH PVT. LTD. • Site Expense Management System', 14, pageHeight - 8);
        doc.text(`Page ${data.pageNumber}`, pageWidth - 25, pageHeight - 8);
      }
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableOptions);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableOptions);
    } else {
      alert("PDF library is not fully loaded. Please wait a second and try again.");
      return;
    }
    
    // Add corporate footer with page numbers to all pages
    addPdfFooterWithPageNumbers(doc);

    const cleanFilename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(cleanFilename);
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Error generating PDF: " + error.message);
  }
};

export const exportToExcel = (title, columns, rows) => {
  try {
    const safeRows = rows.map(row => 
      row.map(cell => `"${(cell ? cell.toString() : '-').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [columns.join(','), ...safeRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Excel Generation Error: ", error);
    alert("Error generating Excel file: " + error.message);
  }
};

export const handlePrint = () => {
  window.print();
};
