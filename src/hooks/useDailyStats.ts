import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export const useDailyStats = (days: number = 7) => {
  const supabase = useSupabaseClient();

  return useQuery(
    ['daily-stats', days],
    async () => {
      const { data, error } = await supabase
        .from('daily_time_spent')
        .select('*')
        .order('day', { ascending: false })
        .limit(days);

      if (error) throw error;
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
