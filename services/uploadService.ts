/**
 * Upload Service
 * Handles uploading files to the backend storage.
 * In a real environment, this connects to Firebase Storage, S3, or Cloudinary.
 * Currently it creates local object URLs for development.
 */
export const uploadFiles = async (files: File[]): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For development, we create local blob URLs
      const urls = files.map(file => URL.createObjectURL(file));
      resolve(urls);
    }, 1500); // Simulate network delay
  });
};
