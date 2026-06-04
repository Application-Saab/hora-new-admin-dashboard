"use client";

import axios from "axios";
import imageCompression from "browser-image-compression";
import { createPendingUploadsDb } from "./pendingUploadsDb";

import { BASE_URL } from "../../../../utils/apiconstant"
import { MEDIA_WORKER_URL } from "../../../../utils/apiconstant";

// 3 Second Video Clip Generator
export async function create3SecClip(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");

      canvas.width = 480;
      canvas.height = (video.videoHeight / video.videoWidth) * 480;

      const ctx = canvas.getContext("2d");

      const stream = canvas.captureStream();
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      let chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const file = new File([blob], "thumbnail.webm", {
          type: "video/webm",
        });
        resolve(file);
      };

      let startTime = 1;
      video.currentTime = startTime;
      recorder.start();

      const draw = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (video.currentTime - startTime < 3) {
          requestAnimationFrame(draw);
        } else {
          recorder.stop();
        }
      };

      video.ontimeupdate = () => draw();
      video.play();
    };

    video.onerror = reject;
  });
}

// Presigned URL
export const getPresignedUrl = async (file, userId, eventId, folderName) => {
  let token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/customer/event/get-presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder: folderName,
      userId,
      eventId,
    }),
  });

  if (!res.ok) throw new Error("Failed to get presigned URL");
  return res.json();
};

// Upload to S3
export const uploadToS3 = async (file, uploadURL) => {
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) throw new Error("S3 upload failed");
  return true;
};

//  Upload to s3 with progress tracking
export async function uploadToS3WithProgress(file, presignedUrl, onProgress) {
  return axios.put(presignedUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (p) => {
      const percent = Math.round((p.loaded * 100) / p.total);
      onProgress(percent);
    },
  });
}

export async function convertToWebP(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const webpFile = new File([blob], "thumbnail.webp", {
            type: "image/webp",
          });
          resolve(webpFile);
        },
        "image/webp",
        0.9,
      );
    };
  });
}

export async function uploadImage(
  file,
  userId,
  eventId,
  folderName,
  onProgress,
  isNotes = false,
) {
  // STEP 1: compression
  const thumb = await imageCompression(file, {
    // maxSizeMB: 0.25,
    // maxWidthOrHeight: 400,
    maxSizeMB: 0.6, // size
    maxWidthOrHeight: 800, // better resolution
    initialQuality: 0.9,
    useWebWorker: true,
  });

  // STEP 2: convert to WebP
  let webpThumbnail;
  try {
    if (!isNotes) {
      webpThumbnail = await convertToWebP(thumb);
    } else {
      webpThumbnail = await convertToWebP(file);
    }
  } catch (error) {
    console.error("WebP conversion failed, using original thumb", error);
    webpThumbnail = thumb;
  }

  // STEP 3: presigned URLs
  const [origSigned, thumbSigned] = await Promise.all([
    getPresignedUrl(file, userId, eventId, folderName),
    getPresignedUrl(webpThumbnail, userId, eventId, folderName),
  ]);

  // STEP 4: upload main + webp thumbnail
  await uploadToS3WithProgress(file, origSigned.uploadURL, onProgress);
  await uploadToS3(webpThumbnail, thumbSigned.uploadURL);

  const originalUrl = `https://photography-hora.s3.eu-north-1.amazonaws.com/${origSigned.key}`;
  const thumbnailUrl = `https://photography-hora.s3.eu-north-1.amazonaws.com/${thumbSigned.key}`;

  return {
    success: true,
    originalKey: origSigned.key,
    thumbnailKey: thumbSigned.key,
    originalUrl,
    thumbnailUrl,
  };
}

export async function uploadVideo(
  file,
  userId,
  eventId,
  folderName,
  onProgress,
) {
  const thumbnailFile = await create3SecClip(file);

  const [origSigned, thumbSigned] = await Promise.all([
    getPresignedUrl(file, userId, eventId, folderName),
    getPresignedUrl(thumbnailFile, userId, eventId, folderName),
  ]);

  await uploadToS3WithProgress(file, origSigned.uploadURL, onProgress);
  await uploadToS3(thumbnailFile, thumbSigned.uploadURL);

  const originalUrl = `https://photography-hora.s3.eu-north-1.amazonaws.com/${origSigned.key}`;
  const thumbnailUrl = `https://photography-hora.s3.eu-north-1.amazonaws.com/${thumbSigned.key}`;

  return {
    success: true,
    originalKey: origSigned.key,
    thumbnailKey: thumbSigned.key,
    originalUrl,
    thumbnailUrl,
  };
}

export async function uploadMedia(
  files,
  userId,
  userName,
  eventId,
  onProgress,
  fileId = null,
) {
  const formData = new FormData();
  console.log(
    "Files being appended:",
    files.length,
    files.map((f) => f.name),
  ); // ← add this

  files.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("fileId", fileId);
  formData.append("postById", userId);
  formData.append("postByName", userName);
  formData.append("postType", "selfUploaded");
  formData.append("folder", "self-upload");

  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${MEDIA_WORKER_URL}/event/upload-event-media/${eventId}`,
    formData,
    {
      headers: {
        Authorization: token,
      },
      onUploadProgress: (p) => {
        const percent = Math.round((p.loaded * 100) / p.total);
        onProgress(percent);
      },
    },
  );

  return res.data.posts;
}

const eventWallUploadsDb = createPendingUploadsDb({
  dbName: "EventWallUploads",
  storeName: "pending",
  version: 1,
  indexes: [
    { name: "eventId", keyPath: "eventId" },
    { name: "status", keyPath: "status" },
  ],
});

export async function getDB() {
  return eventWallUploadsDb.getDB();
}

export async function addToQueue(item) {
  return eventWallUploadsDb.add(item);
}

export async function getPendingUploads(eventId) {
  return eventWallUploadsDb.getAllFromIndex("eventId", eventId);
}

export async function updateQueueItem(id, changes) {
  return eventWallUploadsDb.update(id, changes);
}

export async function removeFromQueue(id) {
  return eventWallUploadsDb.remove(id);
}

export async function clearQueueForEvent(eventId) {
  return eventWallUploadsDb.removeAllFromIndex("eventId", eventId);
}
