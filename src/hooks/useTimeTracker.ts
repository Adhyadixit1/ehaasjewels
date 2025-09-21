import { useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const TIME_UPDATE_INTERVAL = 30; // Update every 30 seconds
const MAX_RETRIES = 3;

export const useTimeTracker = (sessionId: string | null) => {
  const supabase = useSupabaseClient();
  const timerRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const retryCount = useRef(0);

  const updateTimeSpent = async () => {
    if (!sessionId) return;

    const now = Date.now();
    const secondsElapsed = Math.floor((now - lastUpdateTime.current) / 1000);
    lastUpdateTime.current = now;

    if (secondsElapsed <= 0) return;

    try {
      const { error } = await supabase.rpc('increment_time_spent', {
        p_session_id: sessionId,
        p_seconds: secondsElapsed
      });

      if (error) throw error;
      retryCount.current = 0; // Reset retry count on success
    } catch (error) {
      console.error('Error updating time spent:', error);
      // Implement exponential backoff for retries
      const delay = Math.min(1000 * 2 ** retryCount.current, 30000); // Max 30s delay
      retryCount.current = Math.min(retryCount.current + 1, MAX_RETRIES);
      if (retryCount.current < MAX_RETRIES) {
        setTimeout(updateTimeSpent, delay);
      }
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // Initial setup
    lastUpdateTime.current = Date.now();

    // Set up periodic updates
    timerRef.current = window.setInterval(updateTimeSpent, TIME_UPDATE_INTERVAL * 1000);

    // Cleanup on unmount or session change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Send final update
      updateTimeSpent().catch(console.error);
    };
  }, [sessionId]);

  return null;
};
