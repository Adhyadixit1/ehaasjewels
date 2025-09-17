import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const DatabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing database connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        setTestResult(`❌ Database Error: ${error.message}`);
        console.error('Database Error:', error);
      } else {
        setTestResult(`✅ Database Connection Successful!\nAnalytics Settings: ${JSON.stringify(data, null, 2)}`);
        console.log('Analytics Settings:', data);
      }
    } catch (error) {
      setTestResult(`❌ Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Unexpected Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={testDatabaseConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </button>
      </div>
      
      {testResult && (
        <div className="p-4 bg-muted rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
}
