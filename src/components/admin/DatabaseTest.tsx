import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductService } from '@/services/ProductService';
import AuthService from '@/services/AuthService';

export function DatabaseTest() {
  const [testing, setTesting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check current user on component mount
  React.useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking current user:', error);
    }
  };

  const createAndSignInAdmin = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      // Create test admin user (will skip if already exists)
      await AuthService.createTestAdminUser();
      
      // Sign in the admin user
      const adminUser = await AuthService.signInAdmin();
      setUser(adminUser);
      
      setResults([{
        name: 'Admin Authentication',
        success: true,
        message: `Successfully signed in as ${adminUser?.email}`
      }]);
    } catch (error) {
      setError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setResults([]);
    } catch (error) {
      setError(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runTests = async () => {
    setTesting(true);
    setError(null);
    setResults([]);
    const testResults: any[] = [];

    try {
      // Test Database Connection
      const { data, error } = await supabase.from('categories').select('id, name').limit(1);
      testResults.push({
        name: 'Database Connection',
        success: !error,
        message: error ? error.message : 'Connected successfully'
      });

      // Test Authentication
      const { data: { user } } = await supabase.auth.getUser();
      testResults.push({
        name: 'Authentication',
        success: !!user,
        message: user ? `Authenticated as: ${user.email}` : 'No user authenticated'
      });

      // Test Product Creation (if authenticated)
      if (user) {
        try {
          console.log('Starting product creation test...');
          
          const testProduct = {
            name: 'Test Product ' + Date.now(),
            description: 'Test product for database verification with complete details to ensure all fields are properly handled',
            shortDescription: 'Test product for database verification',
            price: 999.99,
            comparePrice: 1299.99,
            category: 'Rings',
            sku: 'TEST' + Date.now(),
            weight: '2.5g',
            material: 'Gold',
            brand: 'Test Brand',
            stockQuantity: 10,
            minStockLevel: 5,
            featured: false,
            isActive: true
          };

          const testImages = [{
            id: 'test-img-' + Date.now(),
            url: 'https://via.placeholder.com/400x400/FFD700/000000?text=Test+Product',
            publicId: 'test_image_' + Date.now(),
            originalName: 'test-product.jpg',
            size: 150000,
            isPrimary: true
          }];

          const testSpecifications = [
            { specName: 'Material', specValue: 'Gold' },
            { specName: 'Weight', specValue: '2.5g' },
            { specName: 'Purity', specValue: '18K' }
          ];

          console.log('Test data prepared:', { testProduct, testImages, testSpecifications });
          
          const product = await ProductService.createProduct(testProduct, testImages, testSpecifications);
          
          testResults.push({
            name: 'Product Creation',
            success: true,
            message: `Product "${product.name}" created successfully with ID: ${product.id}. Images: ${testImages.length}, Specs: ${testSpecifications.length}`
          });
          
          console.log('Product creation test completed successfully:', product);
          
        } catch (err) {
          console.error('Product creation test failed:', err);
          testResults.push({
            name: 'Product Creation',
            success: false,
            message: `Error: ${err instanceof Error ? err.message : 'Product creation failed'}`
          });
        }
      }

      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Section */}
        <div className="flex flex-wrap gap-2">
          {!user ? (
            <Button 
              onClick={createAndSignInAdmin} 
              disabled={authLoading}
              className="flex items-center gap-2"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Setup Admin Auth
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                ✓ Signed in as: {user.email}
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          )}
          
          <Button onClick={runTests} disabled={testing}>
            {testing ? 'Testing...' : 'Run Database Tests'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.map((result, index) => (
          <Alert key={index} variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <strong>{result.name}:</strong> {result.message}
            </AlertDescription>
          </Alert>
        ))}
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Setup Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Click <strong>"Setup Admin Auth"</strong> to create and sign in an admin user</li>
            <li>Click <strong>"Run Database Tests"</strong> to verify everything works</li>
            <li>Go to <strong>Admin → Products → Add Product</strong> to test product creation</li>
            <li>Your products will now save to the database!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}