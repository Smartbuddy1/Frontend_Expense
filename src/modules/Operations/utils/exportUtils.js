import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, addPdfSignatures } from './pdfHeaderHelper';

export const exportToPDF = async (title, columns, rows) => {
  try {
    const doc = new jsPDF();
    const startY = await addPdfHeaderWithLogo(
      doc,
      title,
      `Generated on: ${new Date().toLocaleString()} | Official Operations Ledger`
    );

    const safeRows = rows.map(row => row.map(cell => cell ? cell.toString() : '-'));

    const tableOptions = {
      head: [columns],
      body: safeRows,
      startY: 26,
      theme: 'grid',
      styles: { 
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [15, 23, 42],
        lineColor: [37, 99, 235],
        lineWidth: 0.1,
        font: 'helvetica',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableOptions);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableOptions);
    } else {
      alert("PDF library is not fully loaded. Please wait a second and try again.");
      return;
    }
    
    // Add official footer with logo across all pages
    await addPdfFooterWithLogo(doc);
    addPdfSignatures(doc);

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Error generating PDF: " + error.message);
  }
};

export const exportToExcel = (title, columns, rows) => {
  try {
    // Basic CSV format
    const safeRows = rows.map(row => 
      row.map(cell => `"${(cell ? cell.toString() : '-').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [columns.join(','), ...safeRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
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
