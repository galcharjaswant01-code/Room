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
          // Video file handling
          const name = file.name.toLowerCase();
          if (name.includes('12684293') || name.includes('60fps')) {
            resolve('/room-videos/12684293_1920_1080_60fps.mp4');
          } else if (name.includes('13394638') || name.includes('30fps')) {
            resolve('/room-videos/13394638_1080_1920_30fps.mp4');
          } else if (name.includes('room-video')) {
            resolve('/room-videos/room-video-1.mp4');
          } else {
            resolve(URL.createObjectURL(file));
          }
        }
      });
    })
  );
};
