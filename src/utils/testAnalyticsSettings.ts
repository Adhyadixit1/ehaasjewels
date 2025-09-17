import { supabase } from '@/integrations/supabase/client';

export const testAnalyticsSettings = async () => {
  console.log('🔍 Testing analytics settings fetch...');
  
  try {
    const { data, error } = await supabase
      .from('analytics_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ Error fetching analytics settings:', error);
      return { success: false, error };
    }

    console.log('✅ Analytics settings fetched successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
};