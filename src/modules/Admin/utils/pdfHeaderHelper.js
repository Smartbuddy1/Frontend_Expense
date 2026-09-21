import logoImg from '../assets/logo.png';

/**
 * Helper utility for adding the official Aarya Innovtech Logo & Header
 * to jsPDF exports and Print templates across all tabs in ASEMS.
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
  doc.text(subtitle || 'Official Site Operations & Expense Report', centerX, 19, { align: 'center' });

  // Decorative blue header accent line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(14, 23.5, pageWidth - 14, 23.5);

  return 28; // Suggested startY for autoTable
};

/**
 * Helper to produce standard printable HTML header containing the embedded logo
 */
export const getPrintHeaderHtml = async (title, subtitle, metaDetails = []) => {
  const logoBase64 = await getCompanyLogoBase64();
  
  const metaHtml = metaDetails.map(meta => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.85rem; color: #475569;">
      <strong>${escapeHtml(meta.label)}:</strong> <span>${escapeHtml(meta.value)}</span>
    </div>
  `).join('');

  return `
    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <div>
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
export const addPdfFooterWithPageNumbers = async (doc) => {
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
