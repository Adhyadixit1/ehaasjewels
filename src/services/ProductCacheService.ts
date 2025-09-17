// Product cache with LRU eviction policy
class ProductCache {
  private cache: Map<string, any>;
  private maxSize: number;
  private accessOrder: string[];

  constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  // Get a product from cache
  get(key: string) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
        this.accessOrder.push(key);
      }
      return this.cache.get(key);
    }
    return null;
  }

  // Set a product in cache
  set(key: string, value: any) {
    // If cache is at max size, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }

    // Add or update the item
    this.cache.set(key, value);
    
    // Update access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Check if cache has a product
  has(key: string) {
    return this.cache.has(key);
  }

  // Clear the cache
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  // Get cache size
  size() {
    return this.cache.size;
  }
}

// Singleton instance
const productCache = new ProductCache(50);

export class ProductCacheService {
  static getCache() {
    return productCache;
  }

  // Get product from cache
  static getCachedProduct(id: string) {
    return productCache.get(id);
  }

  // Cache a product
  static cacheProduct(id: string, product: any) {
    productCache.set(id, product);
  }

  // Check if product is cached
  static isProductCached(id: string) {
    return productCache.has(id);
  }

  // Get recently viewed products from localStorage
  static getRecentlyViewedProducts(limit: number = 10) {
    try {
      const stored = localStorage.getItem('recentlyViewedProducts');
      if (stored) {
        const products = JSON.parse(stored);
        return Array.isArray(products) ? products.slice(0, limit) : [];
      }
    } catch (error) {
      console.warn('Failed to parse recently viewed products from localStorage:', error);
    }
    return [];
  }

  // Add product to recently viewed
  static addRecentlyViewedProduct(product: any) {
    try {
      const current = this.getRecentlyViewedProducts(20); // Keep max 20 in storage
      const existingIndex = current.findIndex((p: any) => p.id === product.id);
      
      // Remove if already exists
      if (existingIndex > -1) {
        current.splice(existingIndex, 1);
      }
      
      // Add to beginning
      current.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        image_url: product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                  product.product_images?.[0]?.image_url || 
                  null,
        rating: product.average_rating,
        review_count: product.review_count
      });
      
      // Keep only recent items
      const recent = current.slice(0, 20);
      
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to save recently viewed product:', error);
    }
  }
}