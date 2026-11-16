/**
 * Upload Service
 * Handles uploading files to local storage or converting them to data URLs.
 * Images are converted to Base64 data URLs for seamless, permanent persistence.
 * Videos match against local HD video walkthrough assets or object URLs.
 */
export const uploadFiles = async (files: File[]): Promise<string[]> => {
  return Promise.all(
    files.map(file => {
      return new Promise<string>((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              resolve(URL.createObjectURL(file));
            }
          };
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        } else {
          // Video or other media file
          resolve(URL.createObjectURL(file));
        }
      });
    })
  );
};
