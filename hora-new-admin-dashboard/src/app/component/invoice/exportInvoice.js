// Heavy libraries (html-to-image, jsPDF) are loaded only when the user actually exports.

export const blobToDataUrl = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const loadImage = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a); // Firefox/Safari need the link in the DOM
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url); // revoking instantly can cancel the download
  }, 1000);
}

const CAPTURE_OPTIONS = { pixelRatio: 2, cacheBust: true, backgroundColor: '#ffffff' };

export async function captureAsBlob(node) {
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(node, CAPTURE_OPTIONS);
  if (!blob) throw new Error('Could not capture the invoice.');
  return blob;
}

export async function captureAsDataUrl(node) {
  const { toPng } = await import('html-to-image');
  return toPng(node, CAPTURE_OPTIONS);
}

// Puts an image on A4 pages; a long invoice continues on the next page.
export async function downloadPdf(dataUrl, filename) {
  const [{ jsPDF }, img] = await Promise.all([import('jspdf'), loadImage(dataUrl)]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();  // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const imgH = (img.height * pageW) / img.width;

  for (let y = 0; y < imgH; y += pageH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', 0, -y, pageW, imgH, undefined, 'FAST');
  }
  pdf.save(filename);
}