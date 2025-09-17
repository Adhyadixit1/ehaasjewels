// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'djxv1usyv',
  uploadPreset: 'ml_default', // Fixed preset name
  // Note: API keys and secrets should be handled server-side for security
};

// Cloudinary upload function for direct uploads from frontend
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  // Determine resource type based on file type
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

  try {
    console.log('Attempting to upload to Cloudinary:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType: resourceType
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Parse error response if it's JSON
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Cloudinary Error: ${errorData.error?.message || errorText}`);
      } catch {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    console.log('Upload successful:', {
      publicId: data.public_id,
      url: data.secure_url,
      resourceType: data.resource_type
    });
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload media to Cloudinary');
  }
}

// Function to delete image from Cloudinary (requires backend implementation)
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  // Note: Deletion requires server-side implementation due to API signature requirements
  // This is a placeholder for frontend reference
  console.warn('Image deletion should be implemented on the backend for security');
  return false;
}

// Function to generate optimized image URLs
export function getOptimizedImageUrl(
  publicId: string, 
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);

  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformationString}/${publicId}`;
}

// Predefined image size presets
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'fill' as const },
  small: { width: 300, height: 300, crop: 'fill' as const },
  medium: { width: 600, height: 600, crop: 'fit' as const },
  large: { width: 1200, height: 1200, crop: 'fit' as const },
  hero: { width: 1920, height: 1080, crop: 'fill' as const },
} as const;