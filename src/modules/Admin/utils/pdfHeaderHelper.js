import logoImg from '../assets/logo.png';

/**
 * Helper utility for adding the official Aarya Innovtech Logo & Header
 * to jsPDF exports and Print templates across all tabs in ASEMS.
 */

let cachedLogoBase64 = null;

// Fallback vector Aarya logo data URL if image cannot be loaded from filesystem/server
const generateFallbackLogoBase64 = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background gradient box
    const gradient = ctx.createLinearGradient(0, 0, 240, 70);
    gradient.addColorStop(0, '#0284c7');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 5, 60, 60, 12);
    ctx.fill();

    // Icon text AI
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', 30, 36);

    // Text: AARYA INNOVTECH
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AARYA INNOVTECH', 72, 30);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PRIVATE LIMITED', 72, 48);

    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
};

export const getCompanyLogoBase64 = () => {
  if (cachedLogoBase64) return Promise.resolve(cachedLogoBase64);
  
  const sources = [
    '/logo_new.png',
    logoImg,
    '/aarya_logo.jpeg',
    '/SB_Logo.jpg',
    '/logo_left.jpeg',
    '/src/assets/logo.png'
  ].filter(Boolean);

  const loadFromSource = (index) => {
    if (index >= sources.length) {
      cachedLogoBase64 = generateFallbackLogoBase64();
      return Promise.resolve(cachedLogoBase64);
    }
    const src = sources[index];

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 240;
          canvas.height = img.naturalHeight || img.height || 70;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          cachedLogoBase64 = canvas.toDataURL('image/png');
          resolve(cachedLogoBase64);
        } catch (err) {
          loadFromSource(index + 1).then(resolve);
        }
      };
      img.onerror = () => {
        loadFromSource(index + 1).then(resolve);
      };
      img.src = src;
    });
  };

  return loadFromSource(0);
};

/**
 * Adds official Aarya Innovtech logo & header banner to jsPDF (Portrait & Landscape responsive)
 */
export const addPdfHeaderWithLogo = async (doc, title, subtitle) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  try {
    const logoBase64 = await getCompanyLogoBase64();
    if (logoBase64) {
      // Draw Logo at top-left
      doc.addImage(logoBase64, 'PNG', 14, 7, 36, 13);
    }
  } catch (e) {
    console.warn('Could not embed logo in PDF:', e);
  }

  // Draw Title & Subtitle next to the logo
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 54, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle || 'AI AARYA INNOVTECH PVT. LTD. • Official Site Operations & Expense Report', 54, 18);

  // Top Divider Line across full page width
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 23, pageWidth - 14, 23);

  return 28; // Suggested startY for autoTable
};

/**
 * Helper to produce standard printable HTML header containing the embedded logo
 */
export const getPrintHeaderHtml = async (title, subtitle, metaDetails = []) => {
  const logoBase64 = await getCompanyLogoBase64();
  const logoSrc = logoBase64 || '/logo_new.png';

  const metaHtml = metaDetails.map(m => `<div><strong>${m.label}:</strong> ${m.value}</div>`).join('');

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${logoSrc}" alt="Aarya Innovtech Pvt. Ltd." style="height: 50px; max-width: 180px; object-fit: contain;" />
        <div>
          <h1 style="font-size: 19px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 0.02em;">
            AI AARYA INNOVTECH PVT. LTD.
          </h1>
          <p style="font-size: 12px; color: #475569; margin: 3px 0 0 0; font-weight: 600;">
            ${title} ${subtitle ? '• ' + subtitle : ''}
          </p>
        </div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #334155; line-height: 1.4;">
        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        ${metaHtml}
      </div>
    </div>
  `;
};

/**
 * Adds official corporate footer with page numbers and confidentiality note to every page in jsPDF document
 */
export const addPdfFooterWithPageNumbers = (doc, customFooterText) => {
  try {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Bottom Divider Line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      // Footer Text Left
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const footerLeft = customFooterText || 'AI AARYA INNOVTECH PVT. LTD. • Official & Confidential Operations Document';
      doc.text(footerLeft, 14, pageHeight - 7);

      // Footer Text Right (Page X of Y + Timestamp)
      const printTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const footerRight = `Page ${i} of ${pageCount} • Printed at ${printTime}`;
      doc.text(footerRight, pageWidth - 14, pageHeight - 7, { align: 'right' });
    }
  } catch (e) {
    console.warn('Could not add PDF footer:', e);
  }
};

/**
 * Standard corporate footer HTML for print dialogs / iframe prints
 */
export const getPrintFooterHtml = (customText) => {
  return `
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1.5px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; font-weight: 600;">
      <span>${customText || 'Official & Confidential • AI AARYA INNOVTECH PVT. LTD. • Site Operations & Resource Management System'}</span>
      <span>Printed on: ${new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  `;
};
