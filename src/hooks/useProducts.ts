import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '@/services/ProductService';

export interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  description?: string;
  short_description?: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  featured: boolean;
  category_id?: number;
  categories?: {
    name: string;
  };
  product_images?: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProducts(page = 1, limit = 15, categoryId?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: ProductsResponse;

      // Create a 10s timeout to avoid hanging loading states
      const timeout = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Products fetch timeout'));
        }, 10000);
      });

      if (categoryId) {
        response = await Promise.race([
          ProductService.getProductsByCategory(categoryId, page, limit),
          timeout
        ]) as ProductsResponse;
      } else {
        response = await Promise.race([
          ProductService.getProducts(page, limit),
          timeout
        ]) as ProductsResponse;
      }
      
      setProducts(response.products);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    totalPages,
    refetch
  };
}

export function useFeaturedProducts(limit = 24) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ProductService.getFeaturedProducts(limit);
        setProducts(response);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]);

  return {
    products,
    loading,
    error
  };
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await ProductService.getProductById(id.toString());
        setProduct(productData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await ProductService.getCategories();
        setCategories(categoriesData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error
  };
}