function getExtension(fileName = "") {
  const parts = String(fileName).split(".");
  if (parts.length < 2) return "";
  return parts.pop();
}

function buildOpfsKey({ prefix, id, fileName }) {
  const ext = getExtension(fileName);
  return ext ? `${prefix}__${id}.${ext}` : `${prefix}__${id}`;
}

export async function saveFileToOPFS({ rootDir, prefix, id, file }) {
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(rootDir, { create: true });

    const key = buildOpfsKey({ prefix, id, fileName: file?.name });
    const fileHandle = await dir.getFileHandle(key, { create: true });

    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    return { ok: true, key };
  } catch (err) {
    console.error("OPFS save failed:", err);
    return { ok: false, key: null };
  }
}

export async function getFileFromOPFS({ rootDir, key, mimeType, fileName }) {
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle(rootDir, { create: false });
  const fileHandle = await dir.getFileHandle(key, { create: false });
  const blob = await fileHandle.getFile();
  return new File([blob], fileName, { type: mimeType || blob.type });
}

export async function deleteFromOPFS({ rootDir, key }) {
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(rootDir, { create: false });
    await dir.removeEntry(key);
  } catch {}
}

export async function getPreviewFromOPFS({ rootDir, key, fileName }) {
  try {
    const file = await getFileFromOPFS({
      rootDir,
      key,
      mimeType: "",
      fileName,
    });
    return URL.createObjectURL(file);
  } catch (err) {
    console.error("Preview load failed", err);
    return null;
  }
}

