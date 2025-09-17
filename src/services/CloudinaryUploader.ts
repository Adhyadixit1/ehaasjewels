import { supabase } from '@/integrations/supabase/client';
import { CloudinaryAssetsService, CloudinaryUploadResponse } from './CloudinaryAssetsService';

export type UploadOptions = {
  cloudName: string;                 // your Cloudinary cloud name
  uploadPreset?: string;             // unsigned preset if using client-side uploads
  folder?: string;                   // optional folder name in Cloudinary
  tags?: string[];                   // optional tags
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  // For signed uploads you'd pass a signature and timestamp from a server
  signature?: string;
  apiKey?: string;
  timestamp?: number;
};

/**
 * Upload a File object to Cloudinary. Automatically persists the response
 * into your `cloudinary_assets` table via Supabase using CloudinaryAssetsService.
 */
export async function uploadFileToCloudinary(file: File, opts: UploadOptions) {
  if (!opts.cloudName) throw new Error('cloudName is required');

  // Build form data per Cloudinary API
  const formData = new FormData();
  formData.append('file', file);
  if (opts.uploadPreset) formData.append('upload_preset', opts.uploadPreset);
  if (opts.folder) formData.append('folder', opts.folder);
  if (opts.tags?.length) formData.append('tags', opts.tags.join(','));
  if (opts.signature && opts.apiKey && opts.timestamp) {
    formData.append('signature', opts.signature);
    formData.append('api_key', opts.apiKey);
    formData.append('timestamp', String(opts.timestamp));
  }

  const resourceType = opts.resourceType || 'auto';
  const endpoint = `https://api.cloudinary.com/v1_1/${opts.cloudName}/${resourceType}/upload`;

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const payload = (await res.json()) as CloudinaryUploadResponse;

  // Determine uploader (current user) if available
  const { data: userData } = await supabase.auth.getUser();
  const uploadedBy = userData?.user?.id ?? undefined;

  // Persist into cloudinary_assets (upsert on public_id)
  const saved = await CloudinaryAssetsService.saveFromUploadResponse(payload, {
    uploadedBy,
    isExternal: false,
  });

  return { cloudinary: payload, assetRow: saved };
}

/**
 * Convenience: upload by URL (Cloudinary fetch URL). This requires a preset configured for remote fetch
 * or signed params. After upload, the asset is saved to cloudinary_assets.
 */
export async function uploadUrlToCloudinary(url: string, opts: UploadOptions) {
  if (!opts.cloudName) throw new Error('cloudName is required');

  const formData = new FormData();
  formData.append('file', url);
  if (opts.uploadPreset) formData.append('upload_preset', opts.uploadPreset);
  if (opts.folder) formData.append('folder', opts.folder);
  if (opts.tags?.length) formData.append('tags', opts.tags.join(','));
  if (opts.signature && opts.apiKey && opts.timestamp) {
    formData.append('signature', opts.signature);
    formData.append('api_key', opts.apiKey);
    formData.append('timestamp', String(opts.timestamp));
  }

  const resourceType = opts.resourceType || 'auto';
  const endpoint = `https://api.cloudinary.com/v1_1/${opts.cloudName}/${resourceType}/upload`;

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary URL upload failed: ${res.status} ${text}`);
  }

  const payload = (await res.json()) as CloudinaryUploadResponse;

  const { data: userData } = await supabase.auth.getUser();
  const uploadedBy = userData?.user?.id ?? undefined;

  const saved = await CloudinaryAssetsService.saveFromUploadResponse(payload, {
    uploadedBy,
    isExternal: false,
  });

  return { cloudinary: payload, assetRow: saved };
}
