import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, login, signup, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Profile');
  const [authTab, setAuthTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔑 Attempting login for:', loginForm.email);
      
      const success = await login(loginForm.email, loginForm.password);
      
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        // Clear form
        setLoginForm({ email: '', password: '' });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: 'Login Error',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔏 Attempting signup for:', signupForm.email);
      
      // Show a timeout warning after 15 seconds
      const timeoutWarning = setTimeout(() => {
        toast({
          title: 'Still Processing',
          description: 'Signup is taking longer than expected. Please wait...',
        });
      }, 15000);
      
      const [firstName, lastName] = signupForm.name.trim().split(' ');
      const result = await signup(
        signupForm.email.trim().toLowerCase(), 
        signupForm.password, 
        firstName || 'User', 
        lastName || ''
      );
      
      // Clear the timeout warning
      clearTimeout(timeoutWarning);
      
      if (result.success) {
        toast({
          title: 'Account Created',
          description: result.error || 'Your account has been created successfully! You can now log in.',
        });
        // Clear form
        setSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        // Switch to login tab
        setAuthTab('login');
      } else {
        toast({
          title: 'Signup Failed',
          description: result.error || 'Failed to create account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      
      // Handle specific timeout errors
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
      
      if (errorMessage.includes('timeout')) {
        toast({
          title: 'Connection Timeout',
          description: 'The signup process timed out. Please check your internet connection and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signup Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
      setLoginForm({ email: '', password: '' });
      setSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="page-scroll bg-background text-foreground pb-28">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/50"
        >
          <div className="py-1 pb-0">
            <div className="flex items-center justify-between">
              <div className="ml-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold text-luxury">Profile</h1>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Profile Content */}
        <main className="px-4 py-6">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email || 'User'}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            {/* Remove development-only user info */}
          </motion.div>

          {/* Menu Options */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  <button 
                    onClick={() => navigate('/orders')}
                    className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">My Orders</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => navigate('/wishlist')}
                    className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Wishlist</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Address Book</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Payment Methods</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="w-full p-4 text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Notifications</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  <button className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Help & Support</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button className="w-full p-4 text-left hover:bg-muted transition-colors border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Settings</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                  <button className="w-full p-4 text-left hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">About</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing out...' : 'Logout'}
            </Button>

            {/* Remove the entire development-only debug info section */}
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="page-scroll bg-background text-foreground pb-28">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/50"
      >
        <div className="py-1 pb-0">
          <div className="flex items-center justify-between">
            <div className="ml-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-luxury">Welcome</h1>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Auth Content */}
      <main className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-luxury mb-2">एहसास</h2>
            <p className="text-muted-foreground">Join our exclusive jewelry community</p>
          </div>

          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Login'}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Forgot your password?{' '}
                      <button type="button" className="text-primary underline">
                        Reset here
                      </button>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      By creating an account, you agree to our{' '}
                      <button type="button" className="text-primary underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-primary underline">
                        Privacy Policy
                      </button>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Profile;