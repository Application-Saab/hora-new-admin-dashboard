
import { deleteFromOPFS as deleteFOrmOPFSGeneric } from "./opfsUploadStore";
import {
  getFileFromOPFS as getFileFromOPFSGeneric,
  getPreviewFromOPFS as getPreviewFromOPFSGeneric,
  saveFileToOPFS as saveFileToOPFSGeneric,
} from "./opfsUploadStore";


function measureImageHeight(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img.height);
    img.onerror = () => resolve(0);
  });
}

// Reorder -> Tallest image -> Big block
function reorderByHeight(items) {
  const result = [];

  for (let i = 0; i < items.length; i += 6) {
    const chunk = items.slice(i, i + 6);

    if (chunk.length < 6) {
      result.push(...chunk);
      continue;
    }

    const tallest = [...chunk].sort((a, b) => b.height - a.height)[0];

    const arranged = [];
    chunk.forEach((img) => {
      if (img === tallest) return;
      arranged.push(img);
    });

    arranged.splice(3, 0, tallest);
    result.push(...arranged);
  }

  return result;
}

// Pin-aware processing
export async function processImagesWithHeight(list) {
  if (!Array.isArray(list)) return [];

  // Separate pinned & unpinned
  const pinned = list.filter(
    (item) => item.isPin && Number.isInteger(item.pinPosition),
  );

  const unpinned = list.filter((item) => !item.isPin);

  // Measure height ONLY for unpinned
  const enrichedUnpinned = await Promise.all(
    unpinned.map(async (item) => ({
      ...item,
      height: await measureImageHeight(
        item?.postWebpUrl || item?.postUrl || item?.localPreview,
      ),
    })),
  );

  // Apply existing height-based reorder
  const reorderedUnpinned = reorderByHeight(enrichedUnpinned);

  // Inject pinned back at fixed positions
  const finalResult = [...reorderedUnpinned];

  pinned
    .sort((a, b) => a.pinPosition - b.pinPosition)
    .forEach((item) => {
      const index = item.pinPosition - 1;
      finalResult.splice(index, 0, item);
    });

  return finalResult;
}

const OPFS_ROOT_DIR = "eventwall-temp-uploads";

export async function saveFileToOPFS(file, eventId, uniqueId) {
  const res = await saveFileToOPFSGeneric({
    rootDir: OPFS_ROOT_DIR,
    prefix: eventId,
    id: uniqueId,
    file,
  });
  return res.ok;
}

export async function getFileFromOPFS(eventId, uniqueId, mimeType, fileName) {
  return getFileFromOPFSGeneric({
    rootDir: OPFS_ROOT_DIR,
    key: `${eventId}__${uniqueId}.${fileName.split(".").pop()}`,
    mimeType,
    fileName,
  });
}

export async function deleteFromOPFS(eventId, uniqueId, fileName = "") {
  const ext = fileName ? fileName.split(".").pop() : "";
  const key = ext ? `${eventId}__${uniqueId}.${ext}` : `${eventId}__${uniqueId}`;
  return deleteFromOPFSGeneric({ rootDir: OPFS_ROOT_DIR, key });
}

export async function getPreviewFromOPFS(eventId, id, fileName) {
  const ext = fileName ? fileName.split(".").pop() : "";
  const key = ext ? `${eventId}__${id}.${ext}` : `${eventId}__${id}`;
  return getPreviewFromOPFSGeneric({ rootDir: OPFS_ROOT_DIR, key, fileName });
}
