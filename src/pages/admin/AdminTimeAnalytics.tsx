import { useDailyStats } from '@/hooks/useDailyStats';
import { TimeSpentChart } from '@/components/dashboard/TimeSpentChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyStats {
  day: string;
  unique_sessions: number;
  total_time_spent_seconds: number;
  avg_time_spent_seconds: number;
}

export const AdminTimeAnalytics = () => {
  const { data: stats, isLoading, error } = useDailyStats(30) as { 
    data: DailyStats[] | undefined; 
    isLoading: boolean; 
    error: Error | null 
  };

  const totalTime = stats?.reduce((acc, day) => acc + (day.total_time_spent_seconds || 0), 0) || 0;
  const avgSessionTime = stats?.reduce((acc, day) => acc + (day.avg_time_spent_seconds || 0), 0) / (stats?.length || 1) || 0;
  const totalSessions = stats?.reduce((acc, day) => acc + (day.unique_sessions || 0), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Time Spent Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m
              </div>
            )}
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {Math.floor(avgSessionTime / 60)}m {Math.floor(avgSessionTime % 60)}s
              </div>
            )}
            <p className="text-xs text-muted-foreground">Average per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Time Spent (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <TimeSpentChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTimeAnalytics;
