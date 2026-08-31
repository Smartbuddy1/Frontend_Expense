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
      doc.addImage(logoBase64, 'PNG', 14, offsetY, logoWidth, logoHeight);
    }
  } catch (e) {
    console.warn('Could not embed logo in PDF header:', e);
  }

  const textStartX = 14 + logoWidth + 4;

  // Draw Title & Subtitle next to the logo
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, textStartX, 13.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle || 'Official Operations & Management Ledger', textStartX, 19);

  // Decorative blue header accent line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(14, 23.5, doc.internal.pageSize.width - 14, 23.5);

  return 27; // Suggested startY for autoTable
};

/**
 * Adds official Aarya Innovtech footer with logo, CIN, contact info, and page numbers across all pages without distortion
 */
export const addPdfFooterWithLogo = async (doc) => {
  try {
    const logoBase64 = await getCompanyLogoBase64();
    const aspect = (cachedLogoData && cachedLogoData.aspect) ? cachedLogoData.aspect : (240 / 60);
    const maxFootW = 20;
    const maxFootH = 6.5;
    let footW = maxFootW;
    let footH = maxFootH;

    if (aspect >= maxFootW / maxFootH) {
      footW = maxFootW;
      footH = maxFootW / aspect;
    } else {
      footH = maxFootH;
      footW = maxFootH * aspect;
    }

    const totalPages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

      // Footer small logo
      if (logoBase64) {
        try {
          const footOffsetY = pageHeight - 14.5 + (maxFootH - footH) / 2;
          doc.addImage(logoBase64, 'PNG', 14, footOffsetY, footW, footH);
        } catch (err) {
          // ignore image error in footer
        }
      }

      const textStartX = 14 + footW + 4;

      // Company info in footer
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('AARYA INNOVTECH PVT. LTD.', textStartX, pageHeight - 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('CIN: U29305MH2019PTC327551 | Ph: +91 9359604384 | Nashik: Makhamalabad Road, Nashik-422003', textStartX, pageHeight - 8);

      // Page numbers on bottom-right
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 9.5, { align: 'right' });
    }
  } catch (e) {
    console.warn('Could not add footer to PDF:', e);
  }
};
