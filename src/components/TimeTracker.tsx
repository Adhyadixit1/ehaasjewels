import { useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useTimeTracker } from '../hooks/useTimeTracker';

export const TimeTracker = () => {
  const session = useSession();
  const sessionId = session?.user?.id || null;
  useTimeTracker(sessionId);
  return null;
};
