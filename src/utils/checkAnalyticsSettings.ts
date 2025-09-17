import { supabase } from '@/integrations/supabase/client';

export const checkAnalyticsSettings = async () => {
  console.log('🔍 Checking analytics settings in database...');
  
  try {
    // First, let's see what's in the table
    const { data: allData, error: allError } = await supabase
      .from('analytics_settings')
      .select('*');

    if (allError) {
      console.error('❌ Error fetching all analytics settings:', allError);
      return { success: false, error: allError };
    }

    console.log('📋 All analytics settings records:', allData);
    
    // Now let's check the specific record we're looking for
    const { data, error } = await supabase
      .from('analytics_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('❌ Error fetching analytics settings (ID=1):', error);
      return { success: false, error };
    }

    console.log('📊 Analytics settings (ID=1):', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
};