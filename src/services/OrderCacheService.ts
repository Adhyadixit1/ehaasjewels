// OrderCacheService.ts
class OrderCacheService {
  private static readonly CACHE_KEY = 'user_orders_cache';
  private static readonly CACHE_TIMESTAMP_KEY = 'user_orders_cache_timestamp';
  private static readonly COOKIE_CACHE_KEY = 'jewellery_ehsaas_orders_cache';
  private static readonly COOKIE_TIMESTAMP_KEY = 'jewellery_ehsaas_orders_timestamp';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration
  private static readonly COOKIE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours cookie cache duration

  /**
   * Save orders data to localStorage cache
   * @param orders - Orders data to cache
   */
  static cacheOrders(orders: any[]): void {
    // Cache to localStorage
    this.cacheOrdersToLocalStorage(orders);
    // Cache to cookies for longer persistence
    this.cacheOrdersToCookies(orders);
  }

  /**
   * Save orders data to localStorage only
   * @param orders - Orders data to cache
   */
  private static cacheOrdersToLocalStorage(orders: any[]): void {
    try {
      const cacheData = {
        orders,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache orders data to localStorage:', error);
    }
  }

  /**
   * Save orders data to cookies for longer persistence
   * @param orders - Orders data to cache
   */
  private static cacheOrdersToCookies(orders: any[]): void {
    try {
      const cacheData = {
        orders,
        timestamp: Date.now()
      };
      const encodedData = btoa(JSON.stringify(cacheData));
      const expires = new Date(Date.now() + this.COOKIE_CACHE_DURATION);
      
      document.cookie = `${this.COOKIE_CACHE_KEY}=${encodedData}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `${this.COOKIE_TIMESTAMP_KEY}=${Date.now()}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to cache orders data to cookies:', error);
    }
  }

  /**
   * Get cached orders data if available and not expired
   * @returns Cached orders data or null if not available/expired
   */
  static getCachedOrders(): any[] | null {
    // First try localStorage (faster, shorter duration)
    const localStorageOrders = this.getCachedOrdersFromLocalStorage();
    if (localStorageOrders) {
      return localStorageOrders;
    }
    
    // If localStorage cache is expired or not available, try cookies
    const cookieOrders = this.getCachedOrdersFromCookies();
    if (cookieOrders) {
      // Refresh localStorage with cookie data for faster access next time
      this.cacheOrdersToLocalStorage(cookieOrders);
      return cookieOrders;
    }
    
    return null;
  }

  /**
   * Get cached orders from localStorage
   * @returns Cached orders data or null if not available/expired
   */
  private static getCachedOrdersFromLocalStorage(): any[] | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      
      if (!cachedData || !timestamp) {
        return null;
      }

      const parsedData = JSON.parse(cachedData);
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheTime > this.CACHE_DURATION) {
        // Cache expired, remove it
        this.clearLocalStorageCache();
        return null;
      }
      
      return parsedData.orders;
    } catch (error) {
      console.warn('Failed to retrieve cached orders data from localStorage:', error);
      this.clearLocalStorageCache();
      return null;
    }
  }

  /**
   * Get cached orders from cookies
   * @returns Cached orders data or null if not available/expired
   */
  private static getCachedOrdersFromCookies(): any[] | null {
    try {
      const cookieData = this.getCookie(this.COOKIE_CACHE_KEY);
      const timestamp = this.getCookie(this.COOKIE_TIMESTAMP_KEY);
      
      if (!cookieData || !timestamp) {
        return null;
      }

      const decodedData = JSON.parse(atob(cookieData));
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Check if cookie cache is still valid
      if (now - cacheTime > this.COOKIE_CACHE_DURATION) {
        // Cookie cache expired, remove it
        this.clearCookieCache();
        return null;
      }
      
      return decodedData.orders;
    } catch (error) {
      console.warn('Failed to retrieve cached orders data from cookies:', error);
      this.clearCookieCache();
      return null;
    }
  }

  /**
   * Get cookie value by name
   * @param name - Cookie name
   * @returns Cookie value or null if not found
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Clear the orders cache (both localStorage and cookies)
   */
  static clearCache(): void {
    this.clearLocalStorageCache();
    this.clearCookieCache();
  }

  /**
   * Clear localStorage cache only
   */
  private static clearLocalStorageCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Clear cookie cache only
   */
  private static clearCookieCache(): void {
    try {
      document.cookie = `${this.COOKIE_CACHE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      document.cookie = `${this.COOKIE_TIMESTAMP_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to clear cookie cache:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   * @returns boolean indicating if valid cache exists
   */
  static hasValidCache(): boolean {
    return this.getCachedOrders() !== null;
  }
}

export default OrderCacheService;