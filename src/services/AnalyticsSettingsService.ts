import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsSettings {
  id: number;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  enable_tracking: boolean;
  created_at: string;
  updated_at: string;
}

export class AnalyticsSettingsService {
  private static instance: AnalyticsSettingsService;
  private cache: AnalyticsSettings | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AnalyticsSettingsService {
    if (!AnalyticsSettingsService.instance) {
      AnalyticsSettingsService.instance = new AnalyticsSettingsService();
    }
    return AnalyticsSettingsService.instance;
  }

  /**
   * Get analytics settings from database with caching
   */
  async getSettings(): Promise<AnalyticsSettings> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching analytics settings:', error);
        throw error;
      }

      // Update cache
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return data;
    } catch (error) {
      console.error('Failed to get analytics settings:', error);
      // Return default settings if database fails
      return {
        id: 1,
        google_analytics_id: null,
        facebook_pixel_id: null,
        enable_tracking: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Update analytics settings in database
   */
  async updateSettings(settings: {
    google_analytics_id?: string | null;
    facebook_pixel_id?: string | null;
    enable_tracking?: boolean;
  }): Promise<AnalyticsSettings> {
    try {
      const { data, error } = await supabase
        .from('analytics_settings')
        .update({
          google_analytics_id: settings.google_analytics_id,
          facebook_pixel_id: settings.facebook_pixel_id,
          enable_tracking: settings.enable_tracking,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.error('Error updating analytics settings:', error);
        throw error;
      }

      // Update cache
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log('✅ Analytics settings updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to update analytics settings:', error);
      throw error;
    }
  }

  /**
   * Clear cache to force fresh data fetch
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get formatted settings for frontend use
   */
  async getFormattedSettings(): Promise<{
    googleAnalyticsId: string;
    facebookPixelId: string;
    enableTracking: boolean;
  }> {
    const settings = await this.getSettings();
    return {
      googleAnalyticsId: settings.google_analytics_id || '',
      facebookPixelId: settings.facebook_pixel_id || '',
      enableTracking: settings.enable_tracking
    };
  }

  /**
   * Update settings from frontend format
   */
  async updateFromFrontend(settings: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    enableTracking: boolean;
  }): Promise<AnalyticsSettings> {
    return this.updateSettings({
      google_analytics_id: settings.googleAnalyticsId || null,
      facebook_pixel_id: settings.facebookPixelId || null,
      enable_tracking: settings.enableTracking
    });
  }
}

// Export singleton instance
export const analyticsSettingsService = AnalyticsSettingsService.getInstance();
