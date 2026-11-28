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

const MAX_PIXELS = 16_000_000; 

function captureOptions(node) {
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const pixelRatio = Math.min(2, Math.sqrt(MAX_PIXELS / (width * height)));
  return {
    width,
    height,
    pixelRatio,
    cacheBust: true,
    backgroundColor: '#ffffff',
    style: { margin: '0', boxShadow: 'none' },
  };
}

async function prepare(node) {
  await document.fonts?.ready;
  await Promise.all(
    [...node.querySelectorAll('img')].map(img => (img.complete ? null : img.decode().catch(() => {})))
  );
}

export async function captureAsBlob(node) {
  await prepare(node);
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(node, captureOptions(node));
  if (!blob) throw new Error('Could not capture the invoice.');
  return blob;
}

export async function captureAsDataUrl(node) {
  await prepare(node);
  const { toPng } = await import('html-to-image');
  return toPng(node, captureOptions(node));
}

function findSafeRows(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  const TOL = 14;
  const MAX_ODD = Math.max(4, width * 0.012);
  const safe = new Uint8Array(height);

  const px = (x, y) => (y * width + x) * 4;
  const same = (i, j) =>
    Math.abs(data[i] - data[j]) < TOL &&
    Math.abs(data[i + 1] - data[j + 1]) < TOL &&
    Math.abs(data[i + 2] - data[j + 2]) < TOL;

  for (let y = 0; y < height; y++) {
    const refs = [0.1, 0.5, 0.9].map(f => px(Math.floor(width * f), y));
    let best = Infinity;
    for (const r of refs) {
      let odd = 0;
      for (let x = 0; x < width; x += 2) {
        if (!same(px(x, y), r)) odd++;
        if (odd > best) break;
      }
      best = Math.min(best, odd * 2);
    }
    safe[y] = best <= MAX_ODD ? 1 : 0;
  }
  return safe;
}
export async function downloadPdf(dataUrl, filename) {
  const [{ jsPDF }, img] = await Promise.all([import('jspdf'), loadImage(dataUrl)]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;

  const contentW = pageW - margin * 2;
  const mmPerPx = contentW / img.width;
  const pageHpx = Math.floor((pageH - margin * 2) / mmPerPx);

  const src = document.createElement('canvas');
  src.width = img.width;
  src.height = img.height;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, 0, 0);

  const safe = findSafeRows(sctx, img.width, img.height);

  let start = 0;
  let first = true;
  while (start < img.height) {
    let end = Math.min(start + pageHpx, img.height);

    if (end < img.height) {
      const minEnd = start + Math.floor(pageHpx * 0.65);
      for (let y = end; y > minEnd; y--) {
        if (safe[y]) { end = y; break; }
      }
    }

    const sliceH = end - start;
    const part = document.createElement('canvas');
    part.width = img.width;
    part.height = sliceH;
    part.getContext('2d').drawImage(src, 0, start, img.width, sliceH, 0, 0, img.width, sliceH);

    if (!first) pdf.addPage();
    first = false;
    pdf.addImage(part.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceH * mmPerPx, undefined, 'FAST');

    start = end;
  }

  pdf.save(filename);
}