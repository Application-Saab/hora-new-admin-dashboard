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
  document.body.appendChild(a); 
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url); 
  }, 1000);
}

const CAPTURE_OPTIONS = { pixelRatio: 2, cacheBust: true, backgroundColor: '#ffffff' };

async function prepare(node) {
  await document.fonts?.ready;
  await Promise.all(
    [...node.querySelectorAll('img')].map(img => (img.complete ? null : img.decode().catch(() => {})))
  );
}

export async function captureAsBlob(node) {
  await prepare(node);
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(node, CAPTURE_OPTIONS);
  if (!blob) throw new Error('Could not capture the invoice.');
  return blob;
}

export async function captureAsDataUrl(node) {
  await prepare(node);
  const { toPng } = await import('html-to-image');
  return toPng(node, CAPTURE_OPTIONS);
}

export async function downloadPdf(dataUrl, filename) {
  const [{ jsPDF }, img] = await Promise.all([import('jspdf'), loadImage(dataUrl)]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth(); 
  const pageH = pdf.internal.pageSize.getHeight(); 
  const imgH = (img.height * pageW) / img.width;

  for (let y = 0; y < imgH; y += pageH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', 0, -y, pageW, imgH, undefined, 'FAST');
  }
  pdf.save(filename);
}
