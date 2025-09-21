import { supabase } from '@/integrations/supabase/client';

export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sale_price?: number;
  average_rating?: number;
  review_count?: number;
  category: string;
  sku: string;
  weight?: string;
  material?: string;
  brand?: string;
  stockQuantity: number;
  minStockLevel: number;
  featured: boolean;
  isActive: boolean;
  shortDescription?: string;
  has_music?: boolean;
  music_url?: string;
  music_audio_url?: string;
  music_title?: string;
  music_artist?: string;
  music?: {
    url: string;
    title?: string;
    artist?: string;
  };
  product_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    media_type: string;
  }>;
  product_specifications?: Array<{
    spec_name: string;
    spec_value: string;
  }>;
  categories?: {
    name: string;
  };
}

interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  isPrimary?: boolean;
  type?: 'image' | 'video';
}

interface ProductSpecification {
  specName: string;
  specValue: string;
  displayOrder?: number;
}

interface ProductVariantOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductVariantValue {
  id: number;
  optionId: number;
  value: string;
  displayValue: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  weight: number;
  isActive: boolean;
  sortOrder: number;
  options: {
    optionId: number;
    optionName: string;
    valueId: number;
    value: string;
  }[];
  images: {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
  }[];
}

export class ProductService {
  // ... [previous methods remain the same until getProducts]

  static async getProducts(page = 1, limit = 20): Promise<{
    products: ProductData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Select only the fields we know exist in the database
      const selectFields = `
        *,
        categories (name),
        product_images (id, image_url, is_primary, media_type)
      `;
      
      // First get the count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Then get the paginated data
      const { data: products, error } = await supabase
        .from('products')
        .select(selectFields)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data
      const processedProducts = this.processProductData(products || []);
      
      return {
        products: processedProducts,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }
    static processProductData(products: any[]): ProductData[] {
        return products.map(product => {
            // Safely get music properties with fallbacks
            const musicData = {
                has_music: product.has_music || false,
                music_url: product.music_url || null,
                music_audio_url: product.music_audio_url || null,
                music_title: product.music_title || null,
                music_artist: product.music_artist || null
            };
            
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                comparePrice: product.sale_price,
                category: product.category_id,
                sku: product.sku,
                weight: product.weight,
                material: product.material,
                brand: product.brand,
                stockQuantity: product.stock_quantity,
                minStockLevel: product.min_stock_level,
                featured: product.featured,
                isActive: product.is_active,
                shortDescription: product.short_description,
                ...musicData,
                categories: product.categories,
                product_images: product.product_images,
                created_at: product.created_at,
                updated_at: product.updated_at
            };
        });
    }

  static async getProductsByCategory(categoryId: number, page = 1, limit = 20): Promise<{
    products: ProductData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Select only the fields we know exist in the database
      const selectFields = `
        *,
        categories (name),
        product_images (id, image_url, is_primary, media_type)
      `;
      
      // First get the count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
      
      if (countError) throw countError;
      
      // Then get the paginated data
      const { data: products, error } = await supabase
        .from('products')
        .select(selectFields)
        .eq('category_id', categoryId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data
      const processedProducts = this.processProductData(products || []);
      
      return {
        products: processedProducts,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<ProductData | null> {
    try {
      // Select only the fields we know exist in the database
      const selectFields = `
        *,
        categories (name),
        product_images (id, image_url, is_primary, media_type)
      `;

      const { data: product, error } = await supabase
        .from('products')
        .select(selectFields)
        .eq('id', parseInt(id))
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      if (!product) {
        return null;
      }

      // Process the data
      return this.processProductData([product])[0] || null;
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  }

  // Optimized method to fetch product with variants in parallel
  static async getProductWithVariants(id: string): Promise<{
    product: ProductData | null;
    variants: ProductVariant[];
    variantOptions: any[];
  }> {
    try {
      // Parallel API calls for better performance
      const [productResult, variantsResult, optionsResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (id, image_url, is_primary, media_type)
          `)
          .eq('id', parseInt(id))
          .single(),

        supabase
          .from('product_variants')
          .select(`
            *,
            variant_images (*),
            variant_value_assignments (
              product_variant_options (
                id,
                name,
                display_name
              ),
              product_variant_values (
                id,
                value,
                display_value
              )
            )
          `)
          .eq('product_id', parseInt(id))
          .eq('is_active', true),

        supabase
          .from('product_variant_options')
          .select('*')
          .eq('is_active', true)
      ]);

      if (productResult.error) {
        if (productResult.error.code === 'PGRST116') {
          return { product: null, variants: [], variantOptions: [] };
        }
        throw productResult.error;
      }

      if (!productResult.data) {
        return { product: null, variants: [], variantOptions: [] };
      }

      // Process the product data
      const product = this.processProductData([productResult.data])[0] || null;

      // Process variants data
      const variants = this.processVariantsData(variantsResult.data || []);

      // Process variant options data
      const variantOptions = optionsResult.data || [];

      return { product, variants, variantOptions };
    } catch (error) {
      console.error('Error in getProductWithVariants:', error);
      throw error;
    }
  }

  // Helper method to process variants data
  static processVariantsData(variants: any[]): ProductVariant[] {
    return variants.map(variant => ({
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      stockQuantity: variant.stock_quantity,
      minStockLevel: variant.min_stock_level,
      weight: variant.weight,
      isActive: variant.is_active,
      sortOrder: variant.sort_order,
      options: variant.variant_value_assignments?.map((assignment: any) => ({
        optionId: assignment.product_variant_options?.id || 0,
        optionName: assignment.product_variant_options?.name || '',
        valueId: assignment.product_variant_values?.id || 0,
        value: assignment.product_variant_values?.value || ''
      })) || [],
      images: variant.variant_images?.map((img: any) => ({
        id: img.id,
        imageUrl: img.image_url,
        isPrimary: img.is_primary
      })) || []
    }));
  }
}
