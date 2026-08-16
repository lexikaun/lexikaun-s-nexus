import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { saveAudioBlob, deleteAudioBlob } from './indexedDbStorage';

export interface UploadResult {
  url: string;
  blobId?: string;
  fileSize: number;
}

export async function uploadBeatAudio(
  userId: string,
  beatId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // Always cache locally in IndexedDB first for instant access
  const blobId = `audio_${userId}_${beatId}`;
  await saveAudioBlob(blobId, file, file.name);

  try {
    const storageRef = ref(storage, `users/${userId}/beats/${beatId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.warn('Firebase Storage upload failed, using local storage fallback:', error);
          // Fallback to blob object URL
          const localUrl = URL.createObjectURL(file);
          resolve({
            url: localUrl,
            blobId,
            fileSize: file.size,
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              blobId,
              fileSize: file.size,
            });
          } catch {
            const localUrl = URL.createObjectURL(file);
            resolve({
              url: localUrl,
              blobId,
              fileSize: file.size,
            });
          }
        }
      );
    });
  } catch (err) {
    console.warn('Direct upload error, falling back to local:', err);
    const localUrl = URL.createObjectURL(file);
    return {
      url: localUrl,
      blobId,
      fileSize: file.size,
    };
  }
}

export async function uploadBeatCover(
  userId: string,
  beatId: string,
  file: File
): Promise<string> {
  try {
    const storageRef = ref(storage, `users/${userId}/covers/${beatId}_${file.name}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  } catch (err) {
    console.warn('Cover upload failed, using data url fallback:', err);
    return URL.createObjectURL(file);
  }
}

export async function removeBeatAudio(userId: string, beatId: string, audioUrl: string): Promise<void> {
  const blobId = `audio_${userId}_${beatId}`;
  await deleteAudioBlob(blobId);
  try {
    if (audioUrl.includes('firebasestorage.googleapis.com') || audioUrl.includes('firebasestorage.app')) {
      const storageRef = ref(storage, audioUrl);
      await deleteObject(storageRef);
    }
  } catch (err) {
    console.warn('Could not delete from storage:', err);
  }
}
