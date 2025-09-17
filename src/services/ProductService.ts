import { supabase } from '@/integrations/supabase/client';

export interface ProductData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
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
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  isPrimary?: boolean;
  type?: 'image' | 'video';
}

export interface ProductSpecification {
  specName: string;
  specValue: string;
  displayOrder?: number;
}

export interface ProductVariantOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariantValue {
  id: number;
  optionId: number;
  value: string;
  displayValue: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
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
  
  /**
   * Generate unique SKU
   */
  static generateSKU(category: string): string {
    const prefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Create a new product with images and specifications
   */
  static async createProduct(
    productData: ProductData,
    images: ProductImage[],
    specifications: ProductSpecification[]
  ) {
    try {
      // First, get or create the category
      let categoryId: number | null = null;
      if (productData.category) {
        const category = await this.getCategoryByName(productData.category);
        if (category) {
          categoryId = category.id;
        } else {
          // Create new category if it doesn't exist
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: productData.category })
            .select()
            .single();
          
          if (categoryError) {
            console.warn('Failed to create category:', categoryError.message);
          } else {
            categoryId = newCategory.id;
          }
        }
      }

      // Prepare product data for insertion
      const productInsertData = {
        name: productData.name,
        description: productData.description,
        short_description: productData.shortDescription,
        price: productData.price,
        sale_price: productData.comparePrice,
        category_id: categoryId,
        sku: productData.sku,
        weight: productData.weight,
        material: productData.material,
        brand: productData.brand,
        stock_quantity: productData.stockQuantity,
        min_stock_level: productData.minStockLevel,
        featured: productData.featured,
        is_active: productData.isActive
      };

      // Insert the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productInsertData)
        .select()
        .single();

      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`);
      }

      // Insert images if provided
      if (images && images.length > 0) {
        const imageInsertData = images.map((image, index) => ({
          product_id: product.id,
          image_url: image.url,
          cloudinary_public_id: image.publicId,
          alt_text: image.originalName,
          is_primary: image.isPrimary || index === 0,
          media_type: image.type || 'image',
          sort_order: index
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageInsertData);

        if (imageError) {
          console.warn('Failed to insert product images:', imageError.message);
        }
      }

      // Insert specifications if provided
      if (specifications && specifications.length > 0) {
        const specInsertData = specifications.map((spec, index) => ({
          product_id: product.id,
          spec_name: spec.specName,
          spec_value: spec.specValue,
          display_order: spec.displayOrder || index
        }));

        const { error: specError } = await supabase
          .from('product_specifications')
          .insert(specInsertData);

        if (specError) {
          console.warn('Failed to insert product specifications:', specError.message);
        }
      }

      // Return the created product
      return product;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Update an existing product with images and specifications
   */
  static async updateProduct(
    productId: number,
    productData: ProductData,
    images: ProductImage[],
    specifications: ProductSpecification[]
  ) {
    try {
      // First, get or create the category
      let categoryId: number | null = null;
      if (productData.category) {
        const category = await this.getCategoryByName(productData.category);
        if (category) {
          categoryId = category.id;
        } else {
          // Create new category if it doesn't exist
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: productData.category })
            .select()
            .single();
          
          if (categoryError) {
            console.warn('Failed to create category:', categoryError.message);
          } else {
            categoryId = newCategory.id;
          }
        }
      }

      // Prepare product data for update
      const productUpdateData = {
        name: productData.name,
        description: productData.description,
        short_description: productData.shortDescription,
        price: productData.price,
        sale_price: productData.comparePrice,
        category_id: categoryId,
        sku: productData.sku,
        weight: productData.weight,
        material: productData.material,
        brand: productData.brand,
        stock_quantity: productData.stockQuantity,
        min_stock_level: productData.minStockLevel,
        featured: productData.featured,
        is_active: productData.isActive
      };

      // Update the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .update(productUpdateData)
        .eq('id', productId)
        .select()
        .single();

      if (productError) {
        throw new Error(`Failed to update product: ${productError.message}`);
      }

      // Update images - first delete existing, then insert new ones
      if (images && images.length > 0) {
        // Delete existing images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);

        // Insert new images
        const imageInsertData = images.map((image, index) => ({
          product_id: productId,
          image_url: image.url,
          cloudinary_public_id: image.publicId,
          alt_text: image.originalName,
          is_primary: image.isPrimary || index === 0,
          media_type: image.type || 'image',
          sort_order: index
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageInsertData);

        if (imageError) {
          console.warn('Failed to update product images:', imageError.message);
        }
      }

      // Update specifications - first delete existing, then insert new ones
      if (specifications && specifications.length > 0) {
        // Delete existing specifications
        await supabase
          .from('product_specifications')
          .delete()
          .eq('product_id', productId);

        // Insert new specifications
        const specInsertData = specifications.map((spec, index) => ({
          product_id: productId,
          spec_name: spec.specName,
          spec_value: spec.specValue,
          display_order: spec.displayOrder || index
        }));

        const { error: specError } = await supabase
          .from('product_specifications')
          .insert(specInsertData);

        if (specError) {
          console.warn('Failed to update product specifications:', specError.message);
        }
      }

      // Return the updated product
      return product;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  /**
   * Get single product with all details
   */
  static async getProductById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (id, image_url, cloudinary_public_id, alt_text, is_primary, media_type),
          product_specifications (spec_name, spec_value, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(productId: string) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch product reviews: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      throw error;
    }
  }

  /**
   * Get products with optimized single query
   */
  static async getProducts(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Single query with count and data
      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (id, image_url, is_primary, media_type)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      // If no active products found, retry without active filter to avoid empty feeds (fallback)
      if ((data || []).length === 0) {
        console.warn('No active products found. Retrying without is_active filter to populate feeds.');
        const { data: fallbackData, error: fallbackError, count: fallbackCount } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (id, image_url, is_primary, media_type)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fallbackError) {
          throw new Error(`Failed to fetch products: ${fallbackError.message}`);
        }

        return {
          products: fallbackData || [],
          total: fallbackCount || 0,
          page,
          limit,
          totalPages: Math.ceil((fallbackCount || 0) / limit)
        };
      }

      return {
        products: data || [],
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

  /**
   * Get products by category with optimized query
   */
  static async getProductsByCategory(categoryId: number, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // First get the count
      let { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('category_id', categoryId);

      if (countError) {
        console.warn('Failed to get total count:', countError.message);
      }

      // Then get the data with joins
      let { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (id, image_url, is_primary, media_type)
        `)
        .eq('is_active', true)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }

      // Fallback without is_active filter if needed
      if ((data || []).length === 0) {
        console.warn('No active products for category. Retrying without is_active filter.');
        const retryCountResp = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryId);
        totalCount = retryCountResp.count || 0;

        const retryDataResp = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (id, image_url, is_primary, media_type)
          `)
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        if (!retryDataResp.error) {
          data = retryDataResp.data || [];
        }
      }

      return {
        products: data || [],
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 24) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (image_url, is_primary, media_type)
        `)
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch featured products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      throw error;
    }
  }

  /**
   * Get categories
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Get random products
   */
  static async getRandomProducts(limit = 4) {
    try {
      // First get the total count of products
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (countError) {
        throw new Error(`Failed to fetch product count: ${countError.message}`);
      }

      if (!totalCount) {
        return [];
      }

      // Generate random offsets to get diverse products
      const randomOffsets = [];
      for (let i = 0; i < Math.min(limit, totalCount); i++) {
        // Generate a random offset ensuring we don't exceed the total count
        const maxOffset = Math.max(0, totalCount - limit);
        const offset = Math.floor(Math.random() * (maxOffset + 1));
        randomOffsets.push(offset);
      }

      // Get products at random offsets
      const products = [];
      for (const offset of randomOffsets) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (id, image_url, is_primary, media_type)
          `)
          .eq('is_active', true)
          .range(offset, offset)
          .limit(1);

        if (error) {
          console.warn(`Failed to fetch product at offset ${offset}:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
          products.push(data[0]);
        }
      }

      return products;
    } catch (error) {
      console.error('Error in getRandomProducts:', error);
      return [];
    }
  }

  /**
   * Get category by name
   */
  static async getCategoryByName(name: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw new Error(`Failed to fetch category: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getCategoryByName:', error);
      throw error;
    }
  }

  /**
   * Get related products
   */
  static async getRelatedProducts(productId: string, limit = 4) {
    try {
      // First get the current product to determine its category
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct || !currentProduct.category_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (image_url, is_primary, media_type)
        `)
        .eq('is_active', true)
        .eq('category_id', currentProduct.category_id)
        .neq('id', productId) // Exclude the current product
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Silently handle errors to reduce console noise
        return [];
      }

      return data || [];
    } catch (error) {
      // Silently handle errors to reduce console noise
      return [];
    }
  }

  /**
   * Get product variants for a specific product
   */
  static async getProductVariants(productId: number) {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          variant_value_assignments (
            option_id,
            value_id,
            product_variant_options (name),
            product_variant_values (value)
          ),
          variant_images (
            image_id,
            is_primary,
            product_images (id, image_url)
          )
        `)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        throw new Error(`Failed to fetch product variants: ${error.message}`);
      }

      // Transform the data to match our interface
      const variants = (data || []).map(variant => {
        const options = (variant.variant_value_assignments || []).map(assignment => ({
          optionId: assignment.option_id,
          optionName: assignment.product_variant_options?.name || '',
          valueId: assignment.value_id,
          value: assignment.product_variant_values?.value || ''
        }));

        const images = (variant.variant_images || []).map(imageAssignment => ({
          id: imageAssignment.product_images?.id || 0,
          imageUrl: imageAssignment.product_images?.image_url || '',
          isPrimary: imageAssignment.is_primary || false
        }));

        // Extract image IDs for selection
        const selectedImageIds = (variant.variant_images || []).map(imageAssignment => 
          imageAssignment.product_images?.id || 0
        );

        return {
          id: variant.id,
          productId: variant.product_id,
          sku: variant.sku,
          name: variant.name || '',
          price: variant.price || 0,
          stockQuantity: variant.stock_quantity,
          minStockLevel: variant.min_stock_level,
          weight: variant.weight || 0,
          isActive: variant.is_active,
          sortOrder: variant.sort_order,
          options,
          images,
          selectedImageIds // Added for image selection
        };
      });

      return variants;
    } catch (error) {
      console.error('Error in getProductVariants:', error);
      throw error;
    }
  }

  /**
   * Get variant options for a specific product
   */
  static async getProductVariantOptions(productId: number) {
    try {
      const { data, error } = await supabase
        .from('product_variant_options')
        .select(`
          *,
          product_variant_values (
            id,
            value,
            display_value,
            sort_order,
            is_active
          )
        `)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        throw new Error(`Failed to fetch product variant options: ${error.message}`);
      }

      // Transform the data to match our interface
      const options = (data || []).map(option => ({
        id: option.id,
        name: option.name,
        displayName: option.display_name || option.name,
        sortOrder: option.sort_order,
        isActive: option.is_active,
        values: (option.product_variant_values || [])
          .filter(value => value.is_active)
          .map(value => ({
            id: value.id,
            optionId: option.id,
            value: value.value,
            displayValue: value.display_value || value.value,
            sortOrder: value.sort_order,
            isActive: value.is_active
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }));

      return options;
    } catch (error) {
      console.error('Error in getProductVariantOptions:', error);
      throw error;
    }
  }

  /**
   * Create product variants
   */
  static async createProductVariants(
    productId: number,
    variantOptions: { 
      name: string; 
      displayName: string; 
      values: { value: string; displayValue: string }[] 
    }[],
    variants: { 
      name: string; 
      price: number; 
      stockQuantity: number; 
      optionValues: { optionName: string; value: string }[];
      selectedImageIds?: number[]; // Added for image selection
    }[]
  ) {
    try {
      // Create variant options and their values
      const createdOptions = [];
      for (const option of variantOptions) {
        // Create the option
        const { data: createdOption, error: optionError } = await supabase
          .from('product_variant_options')
          .insert({
            product_id: productId,
            name: option.name,
            display_name: option.displayName
          })
          .select()
          .single();

        if (optionError) {
          throw new Error(`Failed to create variant option: ${optionError.message}`);
        }

        // Create the values for this option
        const valuesToInsert = option.values.map((value, index) => ({
          option_id: createdOption.id,
          value: value.value,
          display_value: value.displayValue,
          sort_order: index
        }));

        let createdValues = [];
        if (valuesToInsert.length > 0) {
          const { data: insertedValues, error: valuesError } = await supabase
            .from('product_variant_values')
            .insert(valuesToInsert)
            .select();

          if (valuesError) {
            throw new Error(`Failed to create variant values: ${valuesError.message}`);
          }
          
          createdValues = insertedValues || [];
        }

        createdOptions.push({
          ...createdOption,
          values: createdValues
        });
      }

      // Create variants
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        
        // Generate SKU if not provided
        const baseSku = await this.getProductSku(productId);
        const optionValues = variant.optionValues.map(ov => ov.value);
        const sku = this.generateVariantSku(baseSku, optionValues);

        // Create the variant
        const { data: createdVariant, error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            sku,
            name: variant.name,
            price: variant.price,
            stock_quantity: variant.stockQuantity
          })
          .select()
          .single();

        if (variantError) {
          throw new Error(`Failed to create variant: ${variantError.message}`);
        }

        // Create variant value assignments (skip for base product which has no options)
        if (i > 0) { // Only for additional variants, not the base product
          for (const optionValue of variant.optionValues) {
            const option = createdOptions.find(o => o.name === optionValue.optionName);
            if (option) {
              const value = option.values.find(v => v.value === optionValue.value);
              if (value) {
                const { error: assignmentError } = await supabase
                  .from('variant_value_assignments')
                  .insert({
                    variant_id: createdVariant.id,
                    option_id: option.id,
                    value_id: value.id
                  });

                if (assignmentError) {
                  throw new Error(`Failed to create variant assignment: ${assignmentError.message}`);
                }
              }
            }
          }
        }

        // Create variant images if selected
        if (variant.selectedImageIds && variant.selectedImageIds.length > 0) {
          // Validate that the image IDs exist in the product_images table before assignment
          const validImageIds: number[] = [];
          
          // Check each image ID to ensure it exists in product_images for this product
          for (const imageId of variant.selectedImageIds) {
            try {
              const { data: imageExists, error: imageCheckError } = await supabase
                .from('product_images')
                .select('id')
                .eq('id', imageId)
                .eq('product_id', productId)
                .maybeSingle();
              
              if (!imageCheckError && imageExists) {
                validImageIds.push(imageId);
              } else {
                console.warn(`Skipping invalid image ID ${imageId} for variant ${createdVariant.id} - not found in product_images for product ${productId}`);
              }
            } catch (checkError) {
              console.warn(`Error checking image ID ${imageId}:`, checkError);
            }
          }
          
          // Create image assignments using upsert to handle conflicts gracefully
          for (const imageId of validImageIds) {
            const imageAssignment = {
              variant_id: createdVariant.id,
              image_id: imageId
            };

            // Use upsert to handle conflicts - this will insert if not exists or do nothing if exists
            const { error: upsertError } = await supabase
              .from('variant_images')
              .upsert(imageAssignment, {
                onConflict: 'variant_id,image_id'
              });
              
            if (upsertError) {
              console.warn(`Failed to assign image ${imageId} to variant ${createdVariant.id}:`, upsertError.message);
            } else {
              console.log(`Successfully assigned image ${imageId} to variant ${createdVariant.id}`);
            }
          }
          
          console.log(`Assigned ${validImageIds.length} images to variant ${createdVariant.id}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in createProductVariants:', error);
      throw error;
    }
  }

  /**
   * Update product variants
   */
  static async updateProductVariants(
    productId: number,
    variantOptions: { 
      id?: number;
      name: string; 
      displayName: string; 
      values: { id?: number; value: string; displayValue: string }[] 
    }[],
    variants: { 
      id?: number;
      name: string; 
      price: number; 
      stockQuantity: number; 
      optionValues: { optionName: string; value: string }[];
      selectedImageIds?: number[]; // Added for image selection
    }[]
  ) {
    try {
      // Delete existing variants for this product
      await this.deleteProductVariants(productId);
      
      // Transform variant options to match createProductVariants signature
      const transformedVariantOptions = variantOptions.map(option => ({
        name: option.name,
        displayName: option.displayName,
        values: option.values.map(value => ({
          value: value.value,
          displayValue: value.displayValue
        }))
      }));
      
      // Recreate variants with new data
      await this.createProductVariants(productId, transformedVariantOptions, variants);
      
      return true;
    } catch (error) {
      console.error('Error in updateProductVariants:', error);
      throw error;
    }
  }

  /**
   * Get product SKU
   */
  static async getProductSku(productId: number): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .eq('id', productId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch product SKU: ${error.message}`);
      }

      return data.sku;
    } catch (error) {
      console.error('Error in getProductSku:', error);
      throw error;
    }
  }

  /**
   * Generate variant SKU
   */
  static generateVariantSku(baseSku: string, optionValues: string[]): string {
    // Create suffix from first letter of each option value
    const suffix = optionValues.map(value => value.charAt(0)).join('').toUpperCase();
    return `${baseSku}-${suffix}`;
  }

  /**
   * Submit a product review
   */
  static async submitProductReview(
    productId: number,
    userId: string,
    rating: number,
    title: string,
    review: string
  ) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: userId,
          rating: rating,
          review_title: title,
          review_text: review,
          is_verified_purchase: true // Assuming verified since they're submitting a review
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit review: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in submitProductReview:', error);
      throw error;
    }
  }

  /**
   * Delete product variants by product ID
   */
  static async deleteProductVariants(productId: number) {
    try {
      // First, get all variant IDs for this product
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId);
      
      if (variantsError && variantsError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch variants: ${variantsError.message}`);
      }
      
      const variantIds = variants?.map(v => v.id) || [];
      
      if (variantIds.length > 0) {
        // Delete variant value assignments first (due to foreign key constraints)
        const { error: assignmentsError } = await supabase
          .from('variant_value_assignments')
          .delete()
          .in('variant_id', variantIds);
        
        if (assignmentsError && assignmentsError.code !== 'PGRST116') {
          throw new Error(`Failed to delete variant assignments: ${assignmentsError.message}`);
        }
        
        // Delete variant images
        const { error: imagesError } = await supabase
          .from('variant_images')
          .delete()
          .in('variant_id', variantIds);
        
        if (imagesError && imagesError.code !== 'PGRST116') {
          throw new Error(`Failed to delete variant images: ${imagesError.message}`);
        }
      }
      
      // Delete variants
      const { error: variantsDeleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);
      
      if (variantsDeleteError && variantsDeleteError.code !== 'PGRST116') {
        throw new Error(`Failed to delete variants: ${variantsDeleteError.message}`);
      }
      
      // Delete variant values and options
      // First get all option IDs for this product
      const { data: options, error: optionsError } = await supabase
        .from('product_variant_options')
        .select('id')
        .eq('product_id', productId);
      
      if (optionsError && optionsError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch variant options: ${optionsError.message}`);
      }
      
      const optionIds = options?.map(o => o.id) || [];
      
      if (optionIds.length > 0) {
        // Delete variant values
        const { error: valuesError } = await supabase
          .from('product_variant_values')
          .delete()
          .in('option_id', optionIds);
        
        if (valuesError && valuesError.code !== 'PGRST116') {
          throw new Error(`Failed to delete variant values: ${valuesError.message}`);
        }
      }
      
      // Delete variant options
      const { error: optionsDeleteError } = await supabase
        .from('product_variant_options')
        .delete()
        .eq('product_id', productId);
      
      if (optionsDeleteError && optionsDeleteError.code !== 'PGRST116') {
        throw new Error(`Failed to delete variant options: ${optionsDeleteError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteProductVariants:', error);
      throw error;
    }
  }
}