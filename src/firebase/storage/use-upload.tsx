
'use client';

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFirebase } from "@/firebase";

export function useUpload() {
  const { storage } = useFirebase();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingMessage, setProcessingMessage] = useState<string>('');

  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!storage) {
        const err = new Error("Storage protocol not initialized in the nexus.");
        setError(err);
        setStatus('error');
        reject(err);
        return;
      }

      if (!file || file.size === 0) {
        const err = new Error("Invalid file protocol detected.");
        setError(err);
        setStatus('error');
        reject(err);
        return;
      }

      setStatus('uploading');
      setProgress(0);
      setError(null);

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = snapshot.totalBytes > 0 
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
            : 0;
          setProgress(Math.round(p));
        },
        (err) => {
          console.error("Upload Sync Error:", err);
          setStatus('error');
          setError(err);
          reject(err);
        },
        async () => {
          try {
            setStatus('processing');
            if (file.type.startsWith('video/')) {
               setProcessingMessage('Encoding video stream...');
               await new Promise(r => setTimeout(r, 2000));
               setProcessingMessage('Finalizing protocols...');
               await new Promise(r => setTimeout(r, 1000));
            } else {
               setProcessingMessage('Generating thumbnails...');
               await new Promise(r => setTimeout(r, 1500));
            }

            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setStatus('done');
            setProgress(100);
            resolve(downloadURL);
          } catch (err: any) {
            console.error("URL Retrieval Error:", err);
            setStatus('error');
            setError(err);
            reject(err);
          }
        }
      );
    });
  };

  return { 
    uploadFile, 
    progress, 
    error, 
    isUploading: status === 'uploading' || status === 'processing',
    status,
    processingMessage
  };
}
