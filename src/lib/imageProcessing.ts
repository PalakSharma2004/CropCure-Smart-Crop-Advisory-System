import imageCompression from "browser-image-compression";

export interface ProcessedImage {
  original: File;
  compressed: File;
  thumbnail: string;
  preview: string;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  thumbnailSize?: number;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  thumbnailSize: 200,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options };

  const compressed = await imageCompression(file, {
    maxSizeMB: opts.maxSizeMB!,
    maxWidthOrHeight: opts.maxWidthOrHeight!,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  return compressed;
}

export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  const thumbnail = await imageCompression(file, {
    maxWidthOrHeight: size,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(thumbnail);
  });
}

export async function processImage(
  file: File,
  options: CompressionOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...defaultOptions, ...options };

  // Compress the image
  const compressed = await compressImage(file, opts);

  // Generate thumbnail
  const thumbnail = await generateThumbnail(file, opts.thumbnailSize);

  // Generate preview
  const preview = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });

  // Get dimensions
  const dimensions = await getImageDimensions(preview);

  return {
    original: file,
    compressed,
    thumbnail,
    preview,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function validateImageFormat(file: File): boolean {
  const validFormats = ["image/jpeg", "image/png", "image/jpg"];
  return validFormats.includes(file.type);
}

export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
