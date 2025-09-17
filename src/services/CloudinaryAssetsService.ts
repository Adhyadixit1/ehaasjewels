import { supabase } from '@/integrations/supabase/client';

// Types shaped after Cloudinary upload API response
// See: https://cloudinary.com/documentation/image_upload_api_reference#upload_response
export type CloudinaryUploadResponse = {
  asset_id?: string;
  public_id: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string; // image | video | raw | auto
  created_at?: string;
  tags?: string[];
  pages?: number;
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
  api_key?: string;
};

export type CloudinaryAssetRow = {
  id?: number;
  public_id: string;
  url: string;
  secure_url: string;
  resource_type: string;
  format: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  folder?: string | null;
  tags?: string[] | null;
  uploaded_by?: string | null; // uuid
  created_at?: string | null;
  is_external?: boolean | null;
  external_source?: string | null;
};

const TABLE = 'cloudinary_assets';

export const CloudinaryAssetsService = {
  // Save or update a Cloudinary asset row from the upload response
  async saveFromUploadResponse(
    resp: CloudinaryUploadResponse,
    opts?: { uploadedBy?: string; isExternal?: boolean; externalSource?: string }
  ) {
    const row: CloudinaryAssetRow = {
      public_id: resp.public_id,
      url: resp.url,
      secure_url: resp.secure_url,
      resource_type: resp.resource_type,
      format: resp.format,
      width: resp.width ?? null,
      height: resp.height ?? null,
      bytes: resp.bytes ?? null,
      folder: resp.folder ?? null,
      tags: resp.tags ?? null,
      uploaded_by: opts?.uploadedBy ?? null,
      is_external: opts?.isExternal ?? false,
      external_source: opts?.externalSource ?? null,
    };

    // Upsert by public_id to avoid duplicates when re-uploading/replacing the same asset
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(row, { onConflict: 'public_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Save an external asset (not uploaded via your Cloudinary account) into the table
  async saveExternalAsset(params: {
    public_id: string;
    url: string;
    secure_url?: string;
    resource_type: string;
    format: string;
    width?: number;
    height?: number;
    bytes?: number;
    folder?: string;
    tags?: string[];
    uploadedBy?: string;
    externalSource?: string;
  }) {
    const row: CloudinaryAssetRow = {
      public_id: params.public_id,
      url: params.url,
      secure_url: params.secure_url ?? params.url,
      resource_type: params.resource_type,
      format: params.format,
      width: params.width ?? null,
      height: params.height ?? null,
      bytes: params.bytes ?? null,
      folder: params.folder ?? null,
      tags: params.tags ?? null,
      uploaded_by: params.uploadedBy ?? null,
      is_external: true,
      external_source: params.externalSource ?? null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(row, { onConflict: 'public_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Optional: helper to link a saved Cloudinary asset to a product_images row (if needed)
  async linkAssetToProduct(params: {
    productId: number;
    publicId: string; // cloudinary public_id
    isPrimary?: boolean;
    mediaType?: 'image' | 'video' | 'raw' | string;
    imageSource?: 'cloudinary' | 'external' | string;
    sortOrder?: number;
  }) {
    // We expect a product_images table with at least: product_id, image_url, cloudinary_public_id, image_source, is_primary, media_type
    // Fetch the asset by public_id to get its URL
    const { data: asset, error: assetErr } = await supabase
      .from(TABLE)
      .select('*')
      .eq('public_id', params.publicId)
      .single();

    if (assetErr) throw assetErr;

    const imagePayload: any = {
      product_id: params.productId,
      image_url: asset?.secure_url || asset?.url,
      cloudinary_public_id: params.publicId,
      image_source: params.imageSource ?? 'cloudinary',
    };

    if (typeof params.isPrimary === 'boolean') imagePayload.is_primary = params.isPrimary;
    if (params.mediaType) imagePayload.media_type = params.mediaType;
    if (typeof params.sortOrder === 'number') imagePayload.sort_order = params.sortOrder;

    const { data, error } = await supabase
      .from('product_images')
      .insert(imagePayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a Cloudinary asset from the database (note: this doesn't delete from Cloudinary itself)
  async deleteAsset(publicId: string) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('public_id', publicId);
    
    if (error) throw error;
    return true;
  },
};
