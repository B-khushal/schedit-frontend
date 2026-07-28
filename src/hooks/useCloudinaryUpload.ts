import { useState, useCallback, useRef } from 'react';
import { apiRequest } from '../lib/api';

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'failed' | 'completed';
  error?: string;
  publicId?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  resourceType?: string;
  xhr?: XMLHttpRequest;
  uploadedBytes: number;
  projectId: string;
  folder?: string;
  fileObj: File;
}

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunk size

export function useCloudinaryUpload() {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const queueRef = useRef<UploadItem[]>([]);
  queueRef.current = uploadQueue;

  const updateQueueItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const performUpload = async (item: UploadItem) => {
    const file = item.fileObj;
    const isChunked = file.size > CHUNK_SIZE;

    try {
      // 1. Fetch signed configuration from the backend
      const folderParam = item.folder ? `&folder=${encodeURIComponent(item.folder)}` : '';
      const signatureConfig = await apiRequest(
        `/api/v1/projects/${item.projectId}/cloudinary/signature?publicId=${encodeURIComponent(item.id)}${folderParam}`
      );

      const { signature, timestamp, apiKey, cloudName, folder, uploadPreset } = signatureConfig;
      const resourceType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'raw' : 'image';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      if (!isChunked) {
        // --- Single Request Upload ---
        const xhr = new XMLHttpRequest();
        updateQueueItem(item.id, { xhr, status: 'uploading' });

        xhr.open('POST', uploadUrl, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            updateQueueItem(item.id, { progress, uploadedBytes: e.loaded });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            updateQueueItem(item.id, {
              status: 'completed',
              progress: 100,
              uploadedBytes: file.size,
              publicId: res.public_id,
              secureUrl: res.secure_url,
              width: res.width,
              height: res.height,
              duration: res.duration,
              format: res.format,
              resourceType: res.resource_type,
            });
            // Automatically save to backend assets collection
            apiRequest(`/api/v1/projects/${item.projectId}/assets`, {
              method: 'POST',
              body: JSON.stringify({
                publicId: res.public_id,
                secureUrl: res.secure_url,
                resourceType: res.resource_type,
                version: res.version,
                bytes: res.bytes,
                width: res.width,
                height: res.height,
                duration: res.duration,
                format: res.format,
                folder: folder,
                tags: res.tags || [],
              }),
            }).catch(console.error);
          } else {
            updateQueueItem(item.id, { status: 'failed', error: `Upload failed: ${xhr.statusText}` });
          }
        };

        xhr.onerror = () => {
          updateQueueItem(item.id, { status: 'failed', error: 'Network error occurred during upload.' });
        };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        if (folder) formData.append('folder', folder);
        if (uploadPreset) formData.append('upload_preset', uploadPreset);
        formData.append('public_id', item.id);

        xhr.send(formData);
      } else {
        // --- Chunked Resumable Upload ---
        const uniqueUploadId = `cloud-chunk-${item.id}-${Date.now()}`;
        let start = item.uploadedBytes;

        const uploadNextChunk = () => {
          // Re-fetch queue item to check if it has been paused or cancelled
          const currentItem = queueRef.current.find((q) => q.id === item.id);
          if (!currentItem || currentItem.status === 'paused' || currentItem.status === 'completed') {
            return;
          }

          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const xhr = new XMLHttpRequest();
          updateQueueItem(item.id, { xhr, status: 'uploading' });

          xhr.open('POST', uploadUrl, true);
          xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
          xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const currentChunkUploaded = e.loaded;
              const totalUploaded = start + currentChunkUploaded;
              const progress = Math.min(Math.round((totalUploaded / file.size) * 100), 99);
              updateQueueItem(item.id, { progress, uploadedBytes: totalUploaded });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const res = JSON.parse(xhr.responseText);
              if (end === file.size) {
                // Done!
                updateQueueItem(item.id, {
                  status: 'completed',
                  progress: 100,
                  uploadedBytes: file.size,
                  publicId: res.public_id,
                  secureUrl: res.secure_url,
                  width: res.width,
                  height: res.height,
                  duration: res.duration,
                  format: res.format,
                  resourceType: res.resource_type,
                });
                // Persist metadata
                apiRequest(`/api/v1/projects/${item.projectId}/assets`, {
                  method: 'POST',
                  body: JSON.stringify({
                    publicId: res.public_id,
                    secureUrl: res.secure_url,
                    resourceType: res.resource_type,
                    version: res.version,
                    bytes: res.bytes,
                    width: res.width,
                    height: res.height,
                    duration: res.duration,
                    format: res.format,
                    folder: folder,
                    tags: res.tags || [],
                  }),
                }).catch(console.error);
              } else {
                // Upload next chunk
                start = end;
                updateQueueItem(item.id, { uploadedBytes: start });
                uploadNextChunk();
              }
            } else {
              updateQueueItem(item.id, { status: 'failed', error: `Chunk upload failed: ${xhr.statusText}` });
            }
          };

          xhr.onerror = () => {
            updateQueueItem(item.id, { status: 'failed', error: 'Network error occurred during chunked upload.' });
          };

          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp);
          formData.append('signature', signature);
          if (folder) formData.append('folder', folder);
          if (uploadPreset) formData.append('upload_preset', uploadPreset);
          formData.append('public_id', item.id);

          xhr.send(formData);
        };

        uploadNextChunk();
      }
    } catch (err: any) {
      updateQueueItem(item.id, { status: 'failed', error: err.message || 'Signature retrieval failed' });
    }
  };

  const uploadFiles = useCallback((files: FileList | File[], projectId: string, folder?: string) => {
    const list = Array.from(files);
    const newItems: UploadItem[] = list.map((file) => {
      // Create a unique clean ID for Cloudinary (alphanumeric and underscores only)
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const id = `${cleanName}_${Date.now()}`;
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
        uploadedBytes: 0,
        projectId,
        folder,
        fileObj: file,
      };
    });

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Start uploading them
    newItems.forEach((item) => {
      performUpload(item);
    });
  }, [updateQueueItem]);

  const pauseUpload = useCallback((id: string) => {
    const item = queueRef.current.find((q) => q.id === id);
    if (item && item.xhr) {
      item.xhr.abort();
      updateQueueItem(id, { status: 'paused', xhr: undefined });
    }
  }, [updateQueueItem]);

  const resumeUpload = useCallback((id: string) => {
    const item = queueRef.current.find((q) => q.id === id);
    if (item && item.status === 'paused') {
      const updatedItem = { ...item, status: 'uploading' as const };
      updateQueueItem(id, { status: 'uploading' });
      performUpload(updatedItem);
    }
  }, [updateQueueItem]);

  const cancelUpload = useCallback((id: string) => {
    const item = queueRef.current.find((q) => q.id === id);
    if (item) {
      if (item.xhr) {
        item.xhr.abort();
      }
      setUploadQueue((prev) => prev.filter((q) => q.id !== id));
    }
  }, []);

  const retryUpload = useCallback((id: string) => {
    const item = queueRef.current.find((q) => q.id === id);
    if (item && item.status === 'failed') {
      const updatedItem = { ...item, status: 'pending' as const, progress: 0, error: undefined };
      updateQueueItem(id, { status: 'pending', progress: 0, error: undefined });
      performUpload(updatedItem);
    }
  }, [updateQueueItem]);

  const clearQueue = useCallback(() => {
    setUploadQueue([]);
  }, []);

  return {
    uploadQueue,
    uploadFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearQueue,
  };
}
