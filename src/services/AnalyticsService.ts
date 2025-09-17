/**
 * Analytics Service for managing Google Analytics and Facebook Pixel integration
 */

import { analyticsSettingsService } from './AnalyticsSettingsService';

export interface AnalyticsSettings {
  googleAnalyticsId: string;
  facebookPixelId: string;
  enableTracking: boolean;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private settings: AnalyticsSettings = {
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableTracking: true
  };
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Update analytics settings
   */
  async updateSettings(newSettings: Partial<AnalyticsSettings>): Promise<void> {
    try {
      // Update database
      await analyticsSettingsService.updateSettings({
        google_analytics_id: newSettings.googleAnalyticsId,
        facebook_pixel_id: newSettings.facebookPixelId,
        enable_tracking: newSettings.enableTracking
      });
      
      // Update local state
      this.settings = { ...this.settings, ...newSettings };
      
      // Only reload analytics if initialized
      if (this.isInitialized) {
        this.reloadAnalytics();
      }
    } catch (error) {
      console.error('Failed to update analytics settings:', error);
      throw error;
    }
  }

  /**
   * Get current analytics settings
   */
  async getSettings(): Promise<AnalyticsSettings> {
    try {
      // Fetch from database
      const dbSettings = await analyticsSettingsService.getFormattedSettings();
      this.settings = dbSettings;
      return { ...this.settings };
    } catch (error) {
      console.error('Failed to get analytics settings:', error);
      // Return current settings as fallback
      return { ...this.settings };
    }
  }

  /**
   * Validate Google Analytics ID format
   */
  validateGoogleAnalyticsId(id: string): boolean {
    if (!id) return false;
    
    // Support both GA4 (G-XXXXXXXXXX) and Universal Analytics (UA-XXXXXXXX-X) formats
    const ga4Pattern = /^G-[A-Z0-9]{10}$/;
    const universalPattern = /^UA-\d{4,10}-\d{1,4}$/;
    
    return ga4Pattern.test(id) || universalPattern.test(id);
  }

  /**
   * Validate Facebook Pixel ID format
   */
  validateFacebookPixelId(id: string): boolean {
    if (!id) return false;
    
    // Facebook Pixel IDs are typically numeric, 15-16 digits
    const pixelPattern = /^\d{15,16}$/;
    
    return pixelPattern.test(id);
  }

  /**
   * Initialize Google Analytics
   */
  private initializeGoogleAnalytics(): void {
    if (!this.settings.enableTracking || !this.settings.googleAnalyticsId) {
      return;
    }

    // Always remove existing Google Analytics script to ensure proper reinitialization
    this.removeGoogleAnalyticsScript();

    // Create and inject Google Analytics script
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.settings.googleAnalyticsId}`;
    
    document.head.appendChild(script);

    // Create Google Analytics configuration
    const config = document.createElement('script');
    config.id = 'google-analytics-config';
    config.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.settings.googleAnalyticsId}');
    `;
    
    document.head.appendChild(config);

    console.log('✅ Google Analytics initialized with ID:', this.settings.googleAnalyticsId);
  }

  /**
   * Initialize Facebook Pixel
   */
  private initializeFacebookPixel(): void {
    if (!this.settings.enableTracking || !this.settings.facebookPixelId) {
      return;
    }

    // Always remove existing Facebook Pixel script to ensure proper reinitialization
    this.removeFacebookPixelScript();

    // Create and inject Facebook Pixel script
    const script = document.createElement('script');
    script.id = 'facebook-pixel-script';
    script.textContent = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.settings.facebookPixelId}');
      fbq('track', 'PageView');
    `;
    
    document.head.appendChild(script);

    // Add Facebook Pixel noscript fallback
    const noscript = document.createElement('noscript');
    noscript.id = 'facebook-pixel-noscript';
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${this.settings.facebookPixelId}&ev=PageView&noscript=1"/>
    `;
    
    document.body.appendChild(noscript);

    console.log('✅ Facebook Pixel initialized with ID:', this.settings.facebookPixelId);
  }

  /**
   * Remove existing Google Analytics scripts
   */
  private removeGoogleAnalyticsScript(): void {
    const gaScript = document.getElementById('google-analytics-script');
    const gaConfig = document.getElementById('google-analytics-config');
    
    if (gaScript) gaScript.remove();
    if (gaConfig) gaConfig.remove();
    
    // Reset the Google Analytics function to ensure proper reinitialization
    if (typeof window !== 'undefined' && window.gtag) {
      delete (window as any).gtag;
    }
    
    // Reset the dataLayer array
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer = [];
    }
  }

  /**
   * Remove existing Facebook Pixel scripts
   */
  private removeFacebookPixelScript(): void {
    const fbScript = document.getElementById('facebook-pixel-script');
    const fbNoscript = document.getElementById('facebook-pixel-noscript');
    
    if (fbScript) fbScript.remove();
    if (fbNoscript) fbNoscript.remove();
    
    // Reset the Facebook Pixel queue and function to ensure proper reinitialization
    if (typeof window !== 'undefined' && window.fbq) {
      delete (window as any).fbq;
    }
  }

  /**
   * Reload analytics scripts
   */
  public reloadAnalytics(): void {
    // Only reload if initialized
    if (!this.isInitialized) {
      return;
    }
    
    if (this.settings.enableTracking) {
      this.initializeGoogleAnalytics();
      this.initializeFacebookPixel();
    } else {
      this.removeGoogleAnalyticsScript();
      this.removeFacebookPixelScript();
    }
  }

  /**
   * Initialize analytics on service creation
   */
  async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this.isInitialized || this.isInitializing) {
      return;
    }
    
    this.isInitializing = true;
    
    try {
      // Load settings from database
      const dbSettings = await analyticsSettingsService.getFormattedSettings();
      this.settings = dbSettings;
      this.reloadAnalytics();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      // Use default settings if database fails
      this.reloadAnalytics();
      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Track page view (for single page applications)
   */
  trackPageView(url?: string): void {
    if (!this.settings.enableTracking) return;

    const pageUrl = url || window.location.pathname + window.location.search;

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      window.gtag('config', this.settings.googleAnalyticsId, {
        page_path: pageUrl
      });
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.settings.enableTracking) return;

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, parameters);
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId && typeof window.fbq !== 'undefined') {
      window.fbq('track', eventName, parameters);
    }
  }

  /**
   * Track purchase event
   */
  trackPurchase(orderData: {
    orderId: string;
    value: number;
    currency: string;
    items?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }): void {
    if (!this.settings.enableTracking) return;

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'purchase', {
        transaction_id: orderData.orderId,
        value: orderData.value,
        currency: orderData.currency,
        items: orderData.items
      });
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Purchase', {
        value: orderData.value,
        currency: orderData.currency,
        content_ids: orderData.items?.map(item => item.id),
        content_type: 'product',
        num_items: orderData.items?.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  }

}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Type definitions for global objects
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}
