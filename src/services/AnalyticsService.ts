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
      console.log('🔄 Updating analytics settings:', newSettings);
      // Update database
      await analyticsSettingsService.updateSettings({
        google_analytics_id: newSettings.googleAnalyticsId,
        facebook_pixel_id: newSettings.facebookPixelId,
        enable_tracking: newSettings.enableTracking
      });
      
      // Update local state
      this.settings = { ...this.settings, ...newSettings };
      console.log('💾 Analytics settings updated in local state:', this.settings);
      
      // Only reload analytics if initialized
      if (this.isInitialized) {
        console.log('🔄 Reloading analytics after settings update...');
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
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('❌ Skipping Google Analytics initialization - not in browser environment');
      return;
    }
    
    console.log('🔵 Initializing Google Analytics with ID:', this.settings.googleAnalyticsId);
    
    if (!this.settings.enableTracking || !this.settings.googleAnalyticsId) {
      console.log('❌ Skipping Google Analytics initialization - tracking disabled or no ID provided');
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
    console.log('✅ Google Analytics script injected into DOM');
    
    // Verify the script was added
    const addedScript = document.getElementById('google-analytics-script');
    if (addedScript) {
      console.log('🔍 Google Analytics script verified in DOM');
    } else {
      console.error('❌ Google Analytics script NOT found in DOM after injection');
    }

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
    console.log('✅ Google Analytics configuration injected into DOM');
    
    // Verify the config was added
    const addedConfig = document.getElementById('google-analytics-config');
    if (addedConfig) {
      console.log('🔍 Google Analytics config verified in DOM');
    } else {
      console.error('❌ Google Analytics config NOT found in DOM after injection');
    }

    console.log('✅ Google Analytics initialized with ID:', this.settings.googleAnalyticsId);
  }

  /**
   * Initialize Facebook Pixel
   */
  private initializeFacebookPixel(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('❌ Skipping Facebook Pixel initialization - not in browser environment');
      return;
    }
    
    console.log('🟡 Initializing Facebook Pixel with ID:', this.settings.facebookPixelId);
    
    if (!this.settings.enableTracking || !this.settings.facebookPixelId) {
      console.log('❌ Skipping Facebook Pixel initialization - tracking disabled or no ID provided');
      return;
    }

    // Always remove existing Facebook Pixel script to ensure proper reinitialization
    this.removeFacebookPixelScript();

    // Create and inject Facebook Pixel script using the standard initialization method
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
    
    // Add error handling
    script.onerror = () => {
      console.error('❌ Failed to load Facebook Pixel script');
    };
    
    document.head.appendChild(script);
    console.log('✅ Facebook Pixel script injected into DOM');
    
    // Verify the script was added
    const addedScript = document.getElementById('facebook-pixel-script');
    if (addedScript) {
      console.log('🔍 Facebook Pixel script verified in DOM');
    } else {
      console.error('❌ Facebook Pixel script NOT found in DOM after injection');
    }

    // Add Facebook Pixel noscript fallback
    const noscript = document.createElement('noscript');
    noscript.id = 'facebook-pixel-noscript';
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${this.settings.facebookPixelId}&ev=PageView&noscript=1"/>
    `;
    
    document.body.appendChild(noscript);
    console.log('✅ Facebook Pixel noscript fallback added to DOM');
    
    // Verify the noscript was added
    const addedNoscript = document.getElementById('facebook-pixel-noscript');
    if (addedNoscript) {
      console.log('🔍 Facebook Pixel noscript verified in DOM');
    } else {
      console.error('❌ Facebook Pixel noscript NOT found in DOM after injection');
    }

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
    console.log('🔄 Reloading analytics scripts with settings:', this.settings);
    
    // Note: During initial initialization, isInitialized will be false
    // But we still want to initialize the scripts, so we check if we have settings
    if (this.settings.enableTracking) {
      console.log('▶️ Tracking is enabled, initializing analytics scripts...');
      this.initializeGoogleAnalytics();
      this.initializeFacebookPixel();
    } else {
      console.log('⏹️ Tracking is disabled, removing analytics scripts...');
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
      console.log('🔍 Loading analytics settings from database...');
      const dbSettings = await analyticsSettingsService.getFormattedSettings();
      console.log('📊 Analytics settings loaded:', dbSettings);
      this.settings = dbSettings;
      this.isInitialized = true;
      this.reloadAnalytics();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      // Use default settings if database fails
      this.isInitialized = true;
      this.reloadAnalytics();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Track page view (for single page applications)
   */
  trackPageView(url?: string): void {
    if (!this.settings.enableTracking) {
      console.log('⏭️ Skipping page view tracking - tracking disabled');
      return;
    }

    const pageUrl = url || window.location.pathname + window.location.search;
    console.log(`📍 Tracking page view for ${pageUrl}`);

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      console.log(`🔵 Tracking page view with Google Analytics (${this.settings.googleAnalyticsId})`);
      window.gtag('config', this.settings.googleAnalyticsId, {
        page_path: pageUrl
      });
    } else {
      console.log('⏭️ Skipping Google Analytics tracking - not configured or gtag not available');
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId) {
      if (typeof window.fbq !== 'undefined') {
        console.log(`🟡 Tracking page view with Facebook Pixel (${this.settings.facebookPixelId})`);
        window.fbq('track', 'PageView');
      } else {
        // If fbq is not available yet, try again after a short delay
        console.log('⏳ Facebook Pixel not ready, retrying in 100ms...');
        setTimeout(() => {
          if (typeof window.fbq !== 'undefined') {
            console.log(`🟡 Tracking page view with Facebook Pixel (${this.settings.facebookPixelId}) [delayed]`);
            window.fbq('track', 'PageView');
          } else {
            console.log('⏭️ Skipping Facebook Pixel tracking - fbq still not available after delay');
          }
        }, 100);
      }
    } else {
      console.log('⏭️ Skipping Facebook Pixel tracking - not configured');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.settings.enableTracking) {
      console.log(`⏭️ Skipping event tracking (${eventName}) - tracking disabled`);
      return;
    }

    console.log(`🎯 Tracking event: ${eventName}`, parameters);

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      console.log(`🔵 Tracking event with Google Analytics (${this.settings.googleAnalyticsId})`);
      window.gtag('event', eventName, parameters);
    } else {
      console.log('⏭️ Skipping Google Analytics event tracking - not configured or gtag not available');
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId) {
      if (typeof window.fbq !== 'undefined') {
        console.log(`🟡 Tracking event with Facebook Pixel (${this.settings.facebookPixelId})`);
        window.fbq('track', eventName, parameters);
      } else {
        // If fbq is not available yet, try again after a short delay
        console.log(`⏳ Facebook Pixel not ready for event ${eventName}, retrying in 100ms...`);
        setTimeout(() => {
          if (typeof window.fbq !== 'undefined') {
            console.log(`🟡 Tracking event with Facebook Pixel (${this.settings.facebookPixelId}) [delayed]`);
            window.fbq('track', eventName, parameters);
          } else {
            console.log(`⏭️ Skipping Facebook Pixel event tracking (${eventName}) - fbq still not available after delay`);
          }
        }, 100);
      }
    } else {
      console.log(`⏭️ Skipping Facebook Pixel event tracking (${eventName}) - not configured`);
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
    if (!this.settings.enableTracking) {
      console.log('⏭️ Skipping purchase tracking - tracking disabled');
      return;
    }

    console.log(`💰 Tracking purchase: ${orderData.orderId}`, orderData);

    // Track with Google Analytics
    if (this.settings.googleAnalyticsId && typeof window.gtag !== 'undefined') {
      console.log(`🔵 Tracking purchase with Google Analytics (${this.settings.googleAnalyticsId})`);
      window.gtag('event', 'purchase', {
        transaction_id: orderData.orderId,
        value: orderData.value,
        currency: orderData.currency,
        items: orderData.items
      });
    } else {
      console.log('⏭️ Skipping Google Analytics purchase tracking - not configured or gtag not available');
    }

    // Track with Facebook Pixel
    if (this.settings.facebookPixelId) {
      if (typeof window.fbq !== 'undefined') {
        console.log(`🟡 Tracking purchase with Facebook Pixel (${this.settings.facebookPixelId})`);
        window.fbq('track', 'Purchase', {
          value: orderData.value,
          currency: orderData.currency,
          content_ids: orderData.items?.map(item => item.id),
          content_type: 'product',
          num_items: orderData.items?.reduce((sum, item) => sum + item.quantity, 0)
        });
      } else {
        // If fbq is not available yet, try again after a short delay
        console.log('⏳ Facebook Pixel not ready for purchase tracking, retrying in 100ms...');
        setTimeout(() => {
          if (typeof window.fbq !== 'undefined') {
            console.log(`🟡 Tracking purchase with Facebook Pixel (${this.settings.facebookPixelId}) [delayed]`);
            window.fbq('track', 'Purchase', {
              value: orderData.value,
              currency: orderData.currency,
              content_ids: orderData.items?.map(item => item.id),
              content_type: 'product',
              num_items: orderData.items?.reduce((sum, item) => sum + item.quantity, 0)
            });
          } else {
            console.log('⏭️ Skipping Facebook Pixel purchase tracking - fbq still not available after delay');
          }
        }, 100);
      }
    } else {
      console.log('⏭️ Skipping Facebook Pixel purchase tracking - not configured');
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
