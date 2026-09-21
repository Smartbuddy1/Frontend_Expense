import logoImg from '../assets/logo.png';

/**
 * Helper utility for adding the official Aarya Innovtech Logo, Header & Footer
 * to jsPDF exports and Print templates across the ASEMS application.
 */

// Print templates build raw HTML strings via template literals and inject them
// with document.write() — any user-entered field (expense description, purpose,
// remarks, names) going into one of those strings unescaped is a stored-XSS hole,
// since it'd run in the app's own origin the next time someone prints that record.
// Always wrap interpolated user text with this first.
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

let cachedLogoData = null;

export const getCompanyLogoBase64 = () => {
  if (cachedLogoData) return Promise.resolve(cachedLogoData.dataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width || 240;
        const naturalH = img.naturalHeight || img.height || 60;
        const canvas = document.createElement('canvas');
        canvas.width = naturalW;
        canvas.height = naturalH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        cachedLogoData = {
          dataUrl,
          aspect: naturalW / naturalH
        };
        resolve(dataUrl);
      } catch (err) {
        resolve(logoImg || '/logo_new.png');
      }
    };
    img.onerror = () => {
      resolve(logoImg || '/logo_new.png');
    };
    img.src = logoImg || '/logo_new.png';
  });
};

/**
 * Adds official Aarya Innovtech logo & header banner to jsPDF without distortion
 */
export const addPdfHeaderWithLogo = async (doc, title, subtitle) => {
  let logoWidth = 36;
  let logoHeight = 12;
  const maxW = 40;
  const maxH = 13;
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const logoBase64 = await getCompanyLogoBase64();
    const aspect = (cachedLogoData && cachedLogoData.aspect) ? cachedLogoData.aspect : (240 / 60);

    // Calculate un-stretched exact aspect ratio
    if (aspect >= maxW / maxH) {
      logoWidth = maxW;
      logoHeight = maxW / aspect;
    } else {
      logoHeight = maxH;
      logoWidth = maxH * aspect;
    }

    if (logoBase64) {
      const offsetY = 7 + (maxH - logoHeight) / 2;
      // Draw Logo at top-right
      doc.addImage(logoBase64, 'PNG', pageWidth - 14 - logoWidth, offsetY, logoWidth, logoHeight);
    }
  } catch (e) {
    console.warn('Could not embed logo in PDF header:', e);
  }

  // Draw Title & Subtitle centered
  const centerX = pageWidth / 2;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(32, 178, 170); // Cyan/Green for title
  doc.text(title, centerX, 13.5, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue for subtitle
  doc.text(subtitle || 'Official Operations Ledger', centerX, 19, { align: 'center' });

  // Decorative blue header accent line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(14, 23.5, pageWidth - 14, 23.5);

  return 28; // Suggested startY for autoTable
};

/**
 * Adds official Aarya Innovtech footer with CIN, contact info, and page numbers across all pages without distortion
 */
export const addPdfFooterWithLogo = async (doc) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

    const textStartX = 14;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    
    // Left side footer text
    doc.text('AARYA INNOVTECH PVT. LTD. CIN: U29305MH2019PTC327551 | +91 9359604384 | https://aaryainnovtech.com/', textStartX, pageHeight - 11);
    doc.text('Nashik Office: Flat No.4A, Sayali Darshan A-Wing, Makhamalabad Road, Nashik-422003.', textStartX, pageHeight - 7);

    // Right side text
    const rightAlignX = pageWidth - 14;
    doc.text(`Page ${i} of ${totalPages}`, rightAlignX, pageHeight - 11, { align: 'right' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, rightAlignX, pageHeight - 7, { align: 'right' });
  }
};

/**
 * Adds signature blocks at the end of the document, on the last page.
 */
export const addPdfSignatures = (doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Go to the last page to add signatures
  const totalPages = doc.internal.getNumberOfPages();
  doc.setPage(totalPages);

  const signatureY = pageHeight - 25; // Placed above the footer
  
  doc.setDrawColor(148, 163, 184); // Gray lines for signature
  doc.setLineWidth(0.3);

  // Left Signature (System Administrator)
  doc.line(20, signatureY, 70, signatureY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('System Administrator', 45, signatureY + 4, { align: 'center' });

  // Right Signature (Authorized Signatory)
  doc.line(pageWidth - 70, signatureY, pageWidth - 20, signatureY);
  doc.text('Authorized Signatory', pageWidth - 45, signatureY + 4, { align: 'center' });
};
