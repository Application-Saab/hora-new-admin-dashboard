'use client';

import React, { useState } from 'react';
import './photoFolder.css'; 
import { MEDIA_PROCESSING_BASE_URL } from '@/utils/apiconstant';


const CHUNK_SIZE = 25 * 1024 * 1024; 
const CONCURRENCY = 3; 
const MAX_RETRIES = 3;

const putChunk = (url, blob, contentType, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.getResponseHeader('ETag'));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(blob);
  });

const putWithRetry = async (chunk, contentType, onProgress) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await putChunk(chunk.url, chunk.blob, contentType, onProgress);
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Part ${chunk.partNumber} failed: ${err.message}`);
      }
      onProgress(0);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
};

const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID(); 
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const getExtension = (fileName) => {
  const idx = fileName.lastIndexOf('.');
  return idx !== -1 ? fileName.slice(idx).toLowerCase() : '.mp4';
};

const getSafeBaseName = (fileName) => {
  const idx = fileName.lastIndexOf('.');
  const base = idx !== -1 ? fileName.slice(0, idx) : fileName;
  return (
    base
      .replace(/[^a-zA-Z0-9_-]+/g, '-') 
      .replace(/-+/g, '-')              
      .replace(/^-|-$/g, '')            
      .slice(0, 100) || 'video'         
  );
};

export default function VideoUpload() {
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).map((file, index) => ({
        id: Date.now() + index + Math.random(),
        file: file,
        progress: 0,
        status: 'pending', 
        url: '', 
      }));

      setFileList((prev) => [...prev, ...selectedFiles]);
    }
    e.target.value = '';
  };

  const handleRemove = (id) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadSingleFile = async (item) => {
    const { file, id } = item;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const contentType = file.type || 'video/mp4';

    setFileList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    try {
      const uniqueFileName = `${generateUniqueId()}_${getSafeBaseName(file.name)}${getExtension(file.name)}`;

const initiateRes = await fetch(`${MEDIA_PROCESSING_BASE_URL}/initiate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: uniqueFileName,   
    fileType: contentType,
    totalChunks: totalChunks,
    folderName: 'video_uploads',
  }),
});

      if (!initiateRes.ok) throw new Error('Failed to initiate upload');

      const { uploadId, key, presignedUrls } = await initiateRes.json();

      const chunks = [];
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        chunks.push({
          partNumber: i + 1,
          blob: file.slice(start, end),
          url: presignedUrls[i],
        });
      }

      const loadedPerPart = {};
      const completedParts = [];
      let nextIndex = 0;

      const updateProgress = () => {
        const totalLoaded = Object.values(loadedPerPart).reduce((a, b) => a + b, 0);
        const percentage = Math.min(Math.round((totalLoaded / file.size) * 100), 99);
        setFileList((prev) =>
          prev.map((f) => (f.id === id && f.progress !== percentage ? { ...f, progress: percentage } : f))
        );
      };

      const worker = async () => {
        while (nextIndex < chunks.length) {
          const chunk = chunks[nextIndex++];

          const eTag = await putWithRetry(chunk, contentType, (loaded) => {
            loadedPerPart[chunk.partNumber] = loaded;
            updateProgress();
          });

          loadedPerPart[chunk.partNumber] = chunk.blob.size;
          updateProgress();

          completedParts.push({
            PartNumber: chunk.partNumber,
            ETag: eTag ? eTag.replace(/"/g, '') : '',
          });
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker)
      );

      const completeRes = await fetch(`${MEDIA_PROCESSING_BASE_URL}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          key,
          parts: completedParts,
        }),
      });

      if (!completeRes.ok) throw new Error('Failed to complete upload');

      const completeData = await completeRes.json();

      const finalVideoUrl = completeData.location || completeData.videoUrl || completeData.url;

      setFileList((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, progress: 100, status: 'completed', url: finalVideoUrl }
            : f
        )
      );
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      setFileList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'error' } : f))
      );
    }
  };

  const handleStartUploadAll = async () => {
    setIsUploading(true);
    const pendingFiles = fileList.filter(
      (item) => item.status === 'pending' || item.status === 'error'
    );

    for (const item of pendingFiles) {
      await uploadSingleFile(item);
    }
    setIsUploading(false);
  };



  return (
    <div className="upload-card">
      <h2 className="upload-title">Upload Videos</h2>

      <div className="select-section">
        <label htmlFor="video-input" className="upload-btn">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Choose Video Files
        </label>
        <input
          id="video-input"
          type="file"
          accept="video/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <p className="upload-hint">Supported Formats: MP4, MOV, WebM (Select multiple videos)</p>
      </div>

      {fileList.length > 0 && (
        <div className="file-list">
          {fileList.map((item) => (
            <div key={item.id} className="file-card">
              <div className="file-header">
                <div className="file-info">
                  <span className="file-icon">🎬</span>
                  <div className="file-details">
                    <span className="file-name">{item.file.name}</span>
                    <span className="file-size">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id)}
                    title="Remove File"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="progress-wrapper">
                <div className="progress-header">
                  <span>
                    {item.status === 'pending' && 'Ready to upload'}
                    {item.status === 'uploading' && 'Uploading...'}
                    {item.status === 'completed' && 'Completed ✅'}
                    {item.status === 'error' && 'Failed ❌'}
                  </span>
                  <span>{item.progress}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${item.status === 'completed' ? 'completed' : ''}`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>

              {item.status === 'completed' && item.url && (
                <div
                  className="url-box"
                  style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
                    Uploaded Video URL:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={item.url}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: '#334155'
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={(e) => {
                        navigator.clipboard.writeText(item.url);
                        const btn = e.currentTarget;
                        btn.innerText = 'Copied! ✅';
                        btn.style.backgroundColor = '#9252aa';
                        setTimeout(() => {
                          btn.innerText = 'Copy';
                          btn.style.backgroundColor = '#9252aa';
                        }, 2000);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className="submit-btn"
            onClick={handleStartUploadAll}
            disabled={isUploading || fileList.every((f) => f.status === 'completed')}
          >
            {isUploading ? 'Uploading Videos...' : 'Start Uploading All'}
          </button>
        </div>
      )}
    </div>
  );
}