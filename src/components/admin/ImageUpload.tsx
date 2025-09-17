import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video, Loader2, Check, AlertCircle, Star, GripVertical, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AdminService from '@/services/AdminService';
import { supabase } from '@/integrations/supabase/client';

interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  isPrimary?: boolean;
  type: 'image' | 'video'; // Added type field
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedMedia[]) => void;
  maxImages?: number;
  existingImages?: UploadedMedia[];
  accept?: string;
  maxFileSize?: number; // in MB
  productId?: number; // For editing existing products
}

export function ImageUpload({
  onImagesChange,
  maxImages = 8, // Updated to match database constraint
  existingImages = [],
  accept = 'image/*', // Focus on images for now
  maxFileSize = 10,
  productId,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<UploadedMedia[]>(existingImages);
  const [uploading, setUploading] = useState<string[]>([]);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Allow both images and videos
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return 'Please select an image or video file';
    }
    
    // Different size limits for images and videos
    const maxSize = file.type.startsWith('video/') ? maxFileSize * 2 : maxFileSize; // 2x size for videos
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    setUploading(prev => [...prev, uploadId]);

    try {
      if (!productId) {
        throw new Error('Product ID is required for upload');
      }

      // Upload to Cloudinary and save to database using AdminService
      const result = await AdminService.uploadProductImage(
        productId,
        file,
        { isPrimary: images.length === 0 } // First image is primary
      );

      const newImage: UploadedMedia = {
        id: result.id,
        url: result.url,
        publicId: result.publicId,
        originalName: result.originalName,
        size: result.size,
        isPrimary: result.isPrimary,
        type: result.type,
      };

      setImages(prev => [...prev, newImage]);
      // Call onImagesChange after state update in useEffect
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => prev.filter(id => id !== uploadId));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      toast({
        title: 'Too many files',
        description: `You can only upload ${remainingSlots} more media file(s)`,
        variant: 'destructive',
      });
      return;
    }

    fileArray.forEach(handleUpload);
  };

  const handleReorder = (reorderedImages: UploadedMedia[]) => {
    setImages(reorderedImages);
    onImagesChange(reorderedImages);
    
    // Update database sort orders
    if (productId) {
      reorderedImages.forEach((image, index) => {
        // We would need to add a method to update sort_order in AdminService
        // For now, we'll just update the local state
        console.log(`Image ${image.id} should have sort_order ${index}`);
      });
    }
  };

  const handleRemove = async (imageId: string) => {
    // Prevent duplicate/remove re-entry for the same image
    if (removingIds.includes(imageId)) return;
    setRemovingIds(prev => [...prev, imageId]);
    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    // Skip database removal if image doesn't have a valid ID (e.g., newly uploaded images not yet saved)
    if (!imageToRemove.id || imageToRemove.id.trim() === '') {
      console.warn('Skipping database removal for image without valid ID:', imageToRemove.url);
      const updated = images.filter(img => img.id !== imageId);
      setImages(updated);
      // onImagesChange will be called in useEffect
      return;
    }

    try {
      // Remove from database using AdminService
      await AdminService.removeProductImage(imageToRemove.id);

      const updated = images.filter(img => img.id !== imageId);
      
      // If we removed the primary image, optimistically mark the first remaining as primary in UI
      // Backend already reassigns the next image as primary; avoid double-calling to prevent race conditions
      if (imageToRemove.isPrimary && updated.length > 0) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      
      setImages(updated);
      // onImagesChange will be called in useEffect
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: 'Remove Failed',
        description: 'Failed to remove image from database',
        variant: 'destructive',
      });
    } finally {
      setRemovingIds(prev => prev.filter(id => id !== imageId));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const imageToSetPrimary = images.find(img => img.id === imageId);
      if (!imageToSetPrimary) {
        throw new Error('Image not found');
      }

      // Skip database update if image doesn't have a valid ID
      if (!imageToSetPrimary.id || imageToSetPrimary.id.trim() === '') {
        console.warn('Skipping database update for image without valid ID:', imageToSetPrimary.url);
        // Just update local state
        setImages(prev => prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        })));
        // onImagesChange will be called in useEffect
        return;
      }

      // Update database: set the selected image as primary
      await AdminService.updateProductImage(imageToSetPrimary.id, { isPrimary: true });

      setImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
      // onImagesChange will be called in useEffect
    } catch (error) {
      console.error('Set primary error:', error);
      toast({
        title: 'Failed to Set Primary',
        description: error instanceof Error ? error.message : 'Failed to set primary image',
        variant: 'destructive',
      });
    }
  };

  // Call onImagesChange when images state changes, but only if they're different from existingImages
  React.useEffect(() => {
    // Only call onImagesChange if the images are actually different from existingImages
    // This prevents infinite loops when the parent component updates its state
    if (JSON.stringify(images) !== JSON.stringify(existingImages)) {
      onImagesChange(images);
    }
  }, [images]);

  // Sync images state when existingImages prop changes, but only if they're actually different
  React.useEffect(() => {
    // Only update images if they're actually different to prevent infinite loops
    if (JSON.stringify(existingImages) !== JSON.stringify(images)) {
      setImages(existingImages);
    }
  }, [existingImages]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [images.length, maxImages]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}>
          <CardContent className="p-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="text-center"
            >
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Upload Product Media</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop images or videos here, or click to select files
              </p>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = accept;
                    input.multiple = true;
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      handleFileSelect(target.files);
                    };
                    input.click();
                  }}
                  className="mb-2"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose Media
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Maximum {maxImages} files, up to {maxFileSize}MB for images, {maxFileSize * 2}MB for videos
                </p>
                <p className="text-xs text-muted-foreground">
                  {images.length}/{maxImages} files uploaded
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading Progress */}
      {uploading.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading {uploading.length} file(s)...</span>
            </div>
            <Progress value={50} className="mt-2" />
          </CardContent>
        </Card>
      )}

      {/* Uploaded Media Grid */}
      {images.length > 0 && (
        <Reorder.Group axis="y" values={images} onReorder={handleReorder} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Reorder.Item
              key={image.id || `image-${index}-${image.url.slice(-10)}`}
              value={image}
              className="relative group aspect-square overflow-hidden rounded-lg border border-border cursor-move"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-square">
                    {image.type === 'video' ? (
                      // Video thumbnail
                      <div className="w-full h-full bg-muted flex items-center justify-center relative">
                        <Video className="w-8 h-8 text-muted-foreground" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white/80 rounded-full p-2">
                            <Play className="w-4 h-4 text-black" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Image
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Type Badge */}
                    <Badge className={`absolute top-2 left-2 ${image.type === 'video' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                      {image.type === 'video' ? 'Video' : 'Image'}
                    </Badge>
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <Badge className="absolute top-2 right-2 bg-yellow-600 text-white">
                        Primary
                      </Badge>
                    )}
                    
                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(image.id)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(image.id)}
                        disabled={removingIds.includes(image.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 rounded p-1">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Media Info */}
                  <CardContent className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Media Upload Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use high-quality images (minimum 800x800px recommended)</li>
                  <li>• Videos should be under 20MB for best performance</li>
                  <li>• The first media will be set as the primary product media</li>
                  <li>• Supported formats: JPG, PNG, WebP, MP4, MOV, AVI</li>
                  <li>• Media are automatically optimized for web delivery</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
