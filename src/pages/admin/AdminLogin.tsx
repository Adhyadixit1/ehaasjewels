import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, loading, isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
  });

  // Check if user is already authenticated and redirect
  useEffect(() => {
    console.log('🔑 Admin Login Auth Check:', { loading, isAuthenticated, isAdmin });
    if (!loading && isAuthenticated && isAdmin) {
      console.log('🔑 User already authenticated, redirecting to admin dashboard...');
      navigate('/admin');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignupMode) {
        // Validate signup form
        if (!formData.email || !formData.password) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all required fields',
            variant: 'destructive',
          });
          return;
        }
        
        if (formData.password.length < 6) {
          toast({
            title: 'Password Too Short',
            description: 'Password must be at least 6 characters long',
            variant: 'destructive',
          });
          return;
        }
        
        // Handle signup
        console.log('🔏 Attempting Supabase signup...');
        
        // Show timeout warning after 15 seconds
        const timeoutWarning = setTimeout(() => {
          toast({
            title: 'Still Processing',
            description: 'Signup is taking longer than expected. Please wait...',
          });
        }, 15000);
        
        const result = await signup(
          formData.email.trim().toLowerCase(), 
          formData.password, 
          formData.firstName || 'User', 
          formData.lastName || 'Admin'
        );
        
        clearTimeout(timeoutWarning);
        
        if (result.success) {
          toast({
            title: 'Signup Successful',
            description: result.error || 'Account created! You can now log in.',
          });
          setIsSignupMode(false); // Switch back to login mode
          // Clear form
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            rememberMe: false,
          });
        } else {
          toast({
            title: 'Signup Failed',
            description: result.error || 'Failed to create account',
            variant: 'destructive',
          });
        }
      } else {
        // Handle login
        console.log('🔑 Attempting Supabase login...');
        const success = await login(formData.email, formData.password);
        
        if (success) {
          toast({
            title: 'Login Successful',
            description: 'Welcome to एहसास Admin Panel',
          });
          
          // Add a small delay to ensure auth state is properly set
          setTimeout(() => {
            console.log('🔑 Navigating to admin dashboard...');
            navigate('/admin');
          }, 500);
        } else {
          toast({
            title: 'Login Failed',
            description: 'Invalid credentials or user not found in Supabase. Try signup first.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `An error occurred during ${isSignupMode ? 'signup' : 'login'}`;
      
      if (errorMessage.includes('timeout')) {
        toast({
          title: 'Connection Timeout',
          description: `The ${isSignupMode ? 'signup' : 'login'} process timed out. Please check your internet connection and try again.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury/5 via-background to-luxury/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center">
            {/* Logo and Brand */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-luxury/10 border border-luxury/20">
                  <Store className="w-8 h-8 text-luxury" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold brand-name text-luxury">एहसास</h1>
                  <p className="text-xs text-muted-foreground">Jewelry Admin</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Secure Admin Access</span>
              </div>
            </motion.div>

            <div>
              <CardTitle className="text-2xl font-bold">{isSignupMode ? 'Create Admin Account' : 'Admin Login'}</CardTitle>
              <CardDescription>
                {isSignupMode 
                  ? 'Create a new admin account in Supabase'
                  : 'Enter your Supabase credentials to access the admin panel'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields (Signup only) */}
              {isSignupMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isSignupMode ? "your@email.com" : "admin@ehsaas.com"}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                  Forgot password?
                </Button>
              </div>

              {/* Login/Signup Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-luxury hover:bg-luxury/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignupMode ? 'Creating Account...' : 'Signing in...'}
                  </div>
                ) : (
                  isSignupMode ? 'Create Account' : 'Sign In'
                )}
              </Button>
              
              {/* Toggle between Login/Signup */}
              <div className="text-center">
                <Button 
                  type="button"
                  variant="link" 
                  size="sm" 
                  onClick={() => setIsSignupMode(!isSignupMode)}
                  className="text-sm"
                >
                  {isSignupMode 
                    ? 'Already have an account? Sign In' 
                    : 'Need an account? Sign Up'
                  }
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30"
            >
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {isSignupMode ? 'Create Admin Account:' : 'Supabase Authentication:'}
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground mb-3">
                {isSignupMode ? (
                  <>
                    <p><strong>Email:</strong> admin@ehsaas.com</p>
                    <p><strong>Password:</strong> admin123456 (min 6 chars)</p>
                    <p><strong>Note:</strong> Creates real account in Supabase</p>
                  </>
                ) : (
                  <>
                    <p><strong>Note:</strong> Must use existing Supabase account</p>
                    <p><strong>No mock authentication</strong> - real database only</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {!isSignupMode && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, email: 'admin@ehsaas.com', password: 'admin123456' }))}
                    className="text-xs"
                  >
                    Auto-fill Demo
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Auth state debug:', { loading });
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs"
                >
                  Clear & Reload
                </Button>
              </div>
            </motion.div>

            {/* Security Notice */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              By signing in, you agree to our security policies and terms of service.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-muted-foreground">
            © 2024 एहसास Jewelry. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}