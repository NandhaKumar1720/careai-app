import { validateImageFile } from './validation';

const MAX_DIMENSION = 320;

/**
 * Reads a local image file and returns a small, compressed data URL so we do
 * not push multi-megabyte blobs into IndexedDB.
 */
export function readAndCompressImage(file: File): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) return Promise.reject(new Error(problem));

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('That image could not be read. Try another file.'));
    reader.onload = () => {
      const source = String(reader.result);
      const image = new Image();
      image.onerror = () => reject(new Error('That image could not be opened. Try another file.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(source);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}
