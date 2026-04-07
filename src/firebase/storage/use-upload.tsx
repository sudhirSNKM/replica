'use client';

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFirebase } from "@/firebase";

export function useUpload() {
  const { storage } = useFirebase();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!storage) {
        const err = new Error("Storage protocol not initialized in the nexus.");
        setError(err);
        reject(err);
        return;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          console.error("Upload Sync Error:", err);
          setIsUploading(false);
          setError(err);
          reject(err);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            resolve(downloadURL);
          } catch (err: any) {
            console.error("URL Retrieval Error:", err);
            setIsUploading(false);
            setError(err);
            reject(err);
          }
        }
      );
    });
  };

  return { uploadFile, progress, error, isUploading };
}
