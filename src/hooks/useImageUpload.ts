import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { compressImage } from '@/lib/imageProcessing';

interface UploadResult {
  url: string;
  path: string;
  thumbnailUrl?: string;
}

interface UploadOptions {
  bucket?: 'crop-images' | 'avatars';
  generateThumbnail?: boolean;
  maxSizeKB?: number;
}

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult | null> => {
    const { bucket = 'crop-images', generateThumbnail = true, maxSizeKB = 1024 } = options;

    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Compress the image
      setProgress(10);
      const compressedFile = await compressImage(file, {
        maxSizeMB: maxSizeKB / 1024,
        maxWidthOrHeight: 1920,
      });
      
      setProgress(30);

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload main image
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      // Get signed URL (1 hour expiry)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw new Error('Failed to generate image URL');
      }
      const publicUrl = signedUrlData.signedUrl;

      let thumbnailUrl: string | undefined;

      // Generate thumbnail if requested
      if (generateThumbnail) {
        try {
          const thumbnailFile = await compressImage(file, {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 300,
          });
          
          const thumbnailPath = `${user.id}/thumbnails/${fileName}`;
          
          const { error: thumbError } = await supabase.storage
            .from(bucket)
            .upload(thumbnailPath, thumbnailFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (!thumbError) {
            const { data: thumbSignedData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(thumbnailPath, 3600);
            thumbnailUrl = thumbSignedData?.signedUrl;
          }
        } catch (thumbError) {
          console.warn('Thumbnail generation failed:', thumbError);
        }
      }

      setProgress(100);
      
      return {
        url: publicUrl,
        path: filePath,
        thumbnailUrl,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (path: string, bucket: 'crop-images' | 'avatars' = 'crop-images') => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
      
      // Also try to delete thumbnail
      const thumbnailPath = path.replace(/\/([^/]+)$/, '/thumbnails/$1');
      await supabase.storage.from(bucket).remove([thumbnailPath]).catch(() => {});
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress,
    error,
    clearError: () => setError(null),
  };
}
