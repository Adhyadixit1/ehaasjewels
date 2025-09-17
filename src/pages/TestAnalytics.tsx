import { useEffect, useState } from 'react';
import { testAnalyticsSettings } from '@/utils/testAnalyticsSettings';
import { checkAnalyticsSettings } from '@/utils/checkAnalyticsSettings';

const TestAnalytics = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      
      // Run the original test
      const testResult = await testAnalyticsSettings();
      setTestResult(testResult);
      
      // Run the new check
      const checkResult = await checkAnalyticsSettings();
      setCheckResult(checkResult);
      
      setIsLoading(false);
    };

    runTests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Settings Test</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Analytics Settings:</h2>
            <pre className="whitespace-pre-wrap bg-background p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Check Analytics Settings:</h2>
            <pre className="whitespace-pre-wrap bg-background p-2 rounded">
              {JSON.stringify(checkResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAnalytics;