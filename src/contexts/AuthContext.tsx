import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthService from '@/services/AuthService';
import OrderCacheService from '@/services/OrderCacheService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'super_admin';
  avatar?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{success: boolean, error?: string}>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState(0); // Timestamp of last auth check
  const AUTH_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds (increased from 3 minutes)

  // Optimized auth state check with interval-based validation
  const checkAuthState = async (forceCheck = false) => {
    const now = Date.now();
    
    // Skip check if not enough time has passed (unless forced)
    if (!forceCheck && lastAuthCheck && (now - lastAuthCheck) < AUTH_CHECK_INTERVAL) {
      console.log('🔑 Skipping auth check - last check was', Math.round((now - lastAuthCheck) / 1000), 'seconds ago');
      return;
    }
    
    try {
      console.log('🔑 Auth state check...', forceCheck ? '(forced)' : '(scheduled)');
      
      // Create timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.warn('⏳ getSession timeout after 15s - using fallback');
          reject(new Error('getSession timeout'));
        }, 15000);
      });

      // Try to get session with timeout as safety net
      let sessionResult: Awaited<ReturnType<typeof supabase.auth.getSession>>;
      let sessionError: any = null;
      
      try {
        console.log('🔑 Calling supabase.auth.getSession()');
        sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        console.log('🔑 supabase.auth.getSession() resolved successfully');
      } catch (error) {
        console.warn('🔑 getSession failed or timed out:', error);
        sessionError = error;
        // Create a fallback result structure
        sessionResult = { data: { session: null }, error: error };
      }

      // Update last check timestamp
      setLastAuthCheck(now);

      const { data: { session } } = sessionResult;
      
      if (sessionError || !sessionResult.data.session) {
        console.log('🔑 No valid session - using cached user if available');
        // Only fallback to cached if no user exists
        if (!user) {
          const cached = localStorage.getItem('ehsaas_admin_user');
          if (cached) {
            try {
              const cachedUser = JSON.parse(cached);
              console.log('🔑 Using cached user from localStorage:', cachedUser);
              setUser(cachedUser);
            } catch {}
          }
        }
      } else if (session?.user) {
        console.log('Found session for:', session.user.email);
        await setUserFromSession(session);
      } else {
        console.log('No session found - clearing user if exists');
        if (user) {
          setUser(null);
          localStorage.removeItem('ehsaas_admin_user');
        }
      }
      
    } catch (error) {
      console.error('Error checking auth state (handled with timeout, non-fatal):', error);
      // Handle refresh token errors specifically
      if (error instanceof Error && error.message.includes('Invalid Refresh Token')) {
        console.log('🔑 Refresh token error detected - forcing logout');
        await logout();
      }
      // Do not clear user here to avoid race with auth state change
    }
  };

  // Initial auth state check - only run once on mount
  useEffect(() => {
    const initialCheck = async () => {
      await checkAuthState(true); // Force initial check
      setInitialCheckComplete(true);
      console.log('🔑 Initial auth state check completed');
    };
    
    initialCheck();
  }, []);

  // Removed periodic auth validation - only check on explicit user actions
  // This reduces unnecessary API calls and improves performance

  // Optimized auth state change listener - minimal API calls
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔑 Auth state change event:', event);
        
        // Only handle SIGNED_OUT event immediately
        if (event === 'SIGNED_OUT') {
          console.log('🔑 User signed out - clearing cache and state');
          setUser(null);
          clearUserCache();
          return;
        }
        
        // For SIGNED_IN, rely on cached data and only verify if needed
        if (event === 'SIGNED_IN') {
          console.log('🔑 User signed in - using cached data');
          // The session data should be available, let's use it to update user
          if (session?.user) {
            // Check if we have cached user data first
            const cachedUser = getCachedUserFromLocalStorage() || getCachedUserFromCookies();
            if (cachedUser && cachedUser.id === session.user.id) {
              console.log('🔑 Using cached user data for signed-in user');
              setUser(cachedUser);
            } else {
              // Only check auth state if no valid cached data
              console.log('🔑 No valid cached data - checking auth state');
              await checkAuthState(true);
            }
          }
        }
        
        // Ignore TOKEN_REFRESH and other frequent events to reduce API calls
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to set user from session
  const setUserFromSession = async (session: any) => {
    try {
      // Add timeout to protect against hanging profile queries
      console.log('🔑 Fetching profile for user:', session.user.id);
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const profileTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('profiles fetch timeout')), 12000);
      });

      let profileRaceResult: any;
      try {
        profileRaceResult = await Promise.race([
          profilePromise,
          profileTimeout
        ]);
      } catch (error) {
        console.warn('🔑 Profile fetch timed out, using basic user:', error);
        profileRaceResult = { data: null, error: error };
      }
      const profile = profileRaceResult?.data as any;

      let userData: User;
      
      if (profile) {
        const emailIsAdmin = (session.user.email || '').toLowerCase().includes('admin');
        const acctType = profile.account_type as 'customer' | 'admin' | 'super_admin' | null;
        const userRole: 'customer' | 'admin' | 'super_admin' =
          acctType === 'admin' || acctType === 'super_admin'
            ? acctType
            : (emailIsAdmin ? 'admin' : 'customer');

        userData = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: profile.first_name || 'User',
          lastName: profile.last_name || '',
          role: userRole,
          permissions: userRole === 'super_admin' ? ['*'] : 
            userRole === 'admin' ? [
              'read:products', 'write:products', 'read:orders', 'write:orders',
              'read:users', 'read:analytics', 'read:settings', 'write:settings'
            ] : ['read:products']
        };
      } else {
        // Create basic user from session
        const emailIsAdmin = (session.user.email || '').toLowerCase().includes('admin');
        userData = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name || 'User',
          lastName: session.user.user_metadata?.last_name || '',
          role: emailIsAdmin ? 'admin' : 'customer',
          permissions: emailIsAdmin ? [
            'read:products', 'write:products', 'read:orders', 'write:orders',
            'read:users', 'read:analytics', 'read:settings', 'write:settings'
          ] : ['read:products']
        };
      }
      
      console.log('Setting user:', userData);
      setUser(userData);
      cacheUserToLocalStorage(userData);
      cacheUserToCookies(userData);
      
    } catch (error) {
      console.warn('🔑 Profile fetch failed or timed out, using basic session user:', error);
      // Create basic user from session
      const emailIsAdmin = (session.user.email || '').toLowerCase().includes('admin');
      const basicUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        firstName: session.user.user_metadata?.first_name || 'User',
        lastName: session.user.user_metadata?.last_name || '',
        role: emailIsAdmin ? 'admin' : 'customer',
        permissions: emailIsAdmin ? [
          'read:products', 'write:products', 'read:orders', 'write:orders',
          'read:users', 'read:analytics', 'read:settings', 'write:settings'
        ] : ['read:products']
      };
      setUser(basicUser);
      cacheUserToLocalStorage(basicUser);
      cacheUserToCookies(basicUser);
    }
  };

  // Enhanced cache management functions
  const cacheUserToLocalStorage = (userData: User) => {
    try {
      localStorage.setItem('ehsaas_admin_user', JSON.stringify(userData));
      console.log('🔑 User cached to localStorage');
    } catch (error) {
      console.warn('🔑 Failed to cache user to localStorage:', error);
    }
  };

  const cacheUserToCookies = (userData: User) => {
    try {
      const userDataString = JSON.stringify(userData);
      const encodedUserData = btoa(userDataString); // Base64 encode for safe storage
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration
      
      document.cookie = `ehsaas_admin_user=${encodedUserData}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
      console.log('🔑 User cached to cookies');
    } catch (error) {
      console.warn('🔑 Failed to cache user to cookies:', error);
    }
  };

  const getCachedUserFromLocalStorage = (): User | null => {
    try {
      const cachedUser = localStorage.getItem('ehsaas_admin_user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
    } catch (error) {
      console.warn('🔑 Failed to get cached user from localStorage:', error);
    }
    return null;
  };

  const getCachedUserFromCookies = (): User | null => {
    try {
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('ehsaas_admin_user='));
      if (userCookie) {
        const encodedUserData = userCookie.split('=')[1];
        const userDataString = atob(encodedUserData); // Base64 decode
        return JSON.parse(userDataString);
      }
    } catch (error) {
      console.warn('🔑 Failed to get cached user from cookies:', error);
    }
    return null;
  };

  const clearUserCache = () => {
    try {
      localStorage.removeItem('ehsaas_admin_user');
      document.cookie = 'ehsaas_admin_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure';
      console.log('🔑 User cache cleared from localStorage and cookies');
    } catch (error) {
      console.warn('🔑 Failed to clear user cache:', error);
    }
  };

  // Load cached user on mount if available (localStorage first, then cookies)
  useEffect(() => {
    if (user) return; // Don't load cache if user is already set
    
    // Try localStorage first (faster access)
    const localStorageUser = getCachedUserFromLocalStorage();
    if (localStorageUser) {
      console.log('🔑 Loaded cached user from localStorage:', localStorageUser);
      setUser(localStorageUser);
      return;
    }
    
    // Fallback to cookies (persistent across sessions)
    const cookieUser = getCachedUserFromCookies();
    if (cookieUser) {
      console.log('🔑 Loaded cached user from cookies:', cookieUser);
      setUser(cookieUser);
      // Also cache to localStorage for faster future access
      cacheUserToLocalStorage(cookieUser);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔑 SUPABASE ONLY AUTH - Attempting login for:', email);
      
      // ONLY use Supabase authentication - NO FALLBACKS
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('🔑 Supabase authentication failed:', authError);
        console.error('🔑 Error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        
        // Handle refresh token errors specifically
        if (authError.message.includes('Invalid Refresh Token')) {
          console.log('🔑 Refresh token error during login - forcing logout');
          await logout();
        }
        
        // If user doesn't exist, suggest signup
        if (authError.message.includes('Invalid login credentials')) {
          console.log('🔑 User may not exist in Supabase - try signup first');
        }
        
        return false; // NO MOCK FALLBACK
      }
      
      // Supabase authentication successful
      if (!authData.user) {
        console.error('🔑 No user data returned from Supabase');
        return false;
      }
      
      console.log('🔑 Supabase authentication successful for:', authData.user.email);
      console.log('🔑 User ID:', authData.user.id);

      // Immediately set a basic authenticated user to unblock routing
      const emailIsAdmin = (authData.user.email || '').toLowerCase().includes('admin');
      const basicUser: User = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: authData.user.user_metadata?.first_name || 'User',
        lastName: authData.user.user_metadata?.last_name || 'Admin',
        role: emailIsAdmin ? 'admin' : 'customer',
        permissions: emailIsAdmin ? [
          'read:products', 'write:products', 'read:orders', 'write:orders',
          'read:users', 'read:analytics', 'read:settings', 'write:settings'
        ] : ['read:products']
      };
      console.log('🔑 Setting basic authenticated user (pre-profile):', basicUser);
      setUser(basicUser);
      cacheUserToLocalStorage(basicUser);
      cacheUserToCookies(basicUser);

      // Fetch or create profile in the background with timeout, then refine user
      (async () => {
        try {
          const fetchProfilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

          const profileTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('profile fetch timeout (login)')), 12000);
          });

          let fetchProfileRace: any;
          try {
            fetchProfileRace = await Promise.race([
              fetchProfilePromise,
              profileTimeout
            ]);
          } catch (error) {
            console.warn('🔑 Profile fetch timed out during login, using basic user:', error);
            fetchProfileRace = { data: null, error: error };
          }
          const existingProfile = fetchProfileRace?.data as any;
          const profileError = fetchProfileRace?.error as any;

          let profile = existingProfile;
          if (profileError && (profileError as any).code !== 'PGRST116') {
            console.warn('🔑 Profile fetch error (non-fatal):', profileError);
            // Handle refresh token errors specifically
            if (profileError.message && profileError.message.includes('Invalid Refresh Token')) {
              console.log('🔑 Refresh token error during profile fetch - forcing logout');
              await logout();
              return;
            }
            return; // keep basic user
          }

          if (!profile) {
            console.log('🔑 Profile not found, creating new profile (background)...');
            const createProfilePromise = supabase
              .from('profiles')
              .insert({
                user_id: authData.user.id,
                email: authData.user.email,
                first_name: authData.user.user_metadata?.first_name || 'User',
                last_name: authData.user.user_metadata?.last_name || 'Admin',
                account_type: email.includes('admin') ? 'admin' : 'customer',
                is_active: true
              })
              .select()
              .single();

            const createTimeout = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('profile create timeout (login)')), 8000);
            });

            const createProfileRace: any = await Promise.race([
              createProfilePromise,
              createTimeout
            ]);
            const newProfile = createProfileRace?.data as any;
            const createError = createProfileRace?.error as any;

            if (createError) {
              console.warn('🔑 Profile creation error (non-fatal):', createError);
              // Handle refresh token errors specifically
              if (createError.message && createError.message.includes('Invalid Refresh Token')) {
                console.log('🔑 Refresh token error during profile creation - forcing logout');
                await logout();
                return;
              }
              return; // keep basic user
            }
            profile = newProfile;
          }

          if (profile) {
            const refinedRole = (profile.account_type === 'admin' || profile.account_type === 'super_admin')
              ? (profile.account_type as 'admin' | 'super_admin')
              : (emailIsAdmin ? 'admin' : 'customer');

            const refinedUser: User = {
              id: authData.user.id,
              email: authData.user.email || '',
              firstName: profile.first_name || basicUser.firstName,
              lastName: profile.last_name || basicUser.lastName,
              role: refinedRole,
              permissions: refinedRole === 'super_admin' ? ['*'] : refinedRole === 'admin' ? [
                'read:products', 'write:products', 'read:orders', 'write:orders',
                'read:users', 'read:analytics', 'read:settings', 'write:settings'
              ] : ['read:products']
            };
            console.log('🔑 Refining user after profile resolution:', refinedUser);
            setUser(refinedUser);
            cacheUserToLocalStorage(refinedUser);
            cacheUserToCookies(refinedUser);
          }
        } catch (bgErr) {
          console.warn('🔑 Background profile resolution failed (non-fatal):', bgErr);
          // Handle refresh token errors specifically
          if (bgErr instanceof Error && bgErr.message.includes('Invalid Refresh Token')) {
            console.log('🔑 Refresh token error during background profile resolution - forcing logout');
            await logout();
          }
        }
      })();

      return true;
      
    } catch (error) {
      console.error('🔑 Login exception:', error);
      // Handle refresh token errors specifically
      if (error instanceof Error && error.message.includes('Invalid Refresh Token')) {
        console.log('🔑 Refresh token error during login exception - forcing logout');
        await logout();
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string = 'User', 
    lastName: string = 'Admin'
  ): Promise<{success: boolean, error?: string}> => {
    try {
      console.log('🔏 SUPABASE SIGNUP - Creating user:', email);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout - please try again')), 30000); // 30 second timeout
      });
      
      // Create user in Supabase Auth with timeout
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      const { data: authData, error: authError } = await Promise.race([
        signupPromise,
        timeoutPromise
      ]);
      
      if (authError) {
        console.error('🔏 Supabase signup failed:', authError);
        return {
          success: false,
          error: authError.message
        };
      }
      
      if (!authData.user) {
        console.error('🔏 No user data returned from signup');
        return {
          success: false,
          error: 'No user data returned'
        };
      }
      
      console.log('🔏 Supabase signup successful:', authData.user.email);
      
      // For email confirmation flow, Supabase may not immediately return session
      if (!authData.session && authData.user) {
        console.log('🔏 Email confirmation required for:', authData.user.email);
        return {
          success: true,
          error: 'Please check your email and click the confirmation link before logging in.'
        };
      }
      
      // Try to create profile with timeout and error handling
      try {
        const profileData = {
          user_id: authData.user.id,
          email: authData.user.email,
          first_name: firstName,
          last_name: lastName,
          account_type: email.includes('admin') ? 'admin' : 'customer',
          is_active: true
        };
        
        const profileTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile creation timeout')), 10000); // 10 second timeout
        });
        
        const profilePromise = supabase
          .from('profiles')
          .insert(profileData);
          
        const { error: profileError } = await Promise.race([
          profilePromise,
          profileTimeout
        ]);
        
        if (profileError) {
          console.warn('🔏 Profile creation failed (may already exist):', profileError);
          // Don't fail signup if profile creation fails
        } else {
          console.log('🔏 Profile created successfully');
        }
      } catch (profileError) {
        console.warn('🔏 Profile creation exception:', profileError);
        // Don't fail signup if profile creation fails
      }
      
      return {
        success: true
      };
      
    } catch (error) {
      console.error('🔏 Signup exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown signup error'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      // Clear order cache first
      OrderCacheService.clearCache();
      console.log('🗑️ Order cache cleared');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
      }
      
      // Clear ALL local state and storage
      setUser(null);
      clearUserCache(); // Clear user cache from both localStorage and cookies
      localStorage.clear(); // Clear all localStorage to remove any other cached data
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if Supabase logout fails
      try {
        OrderCacheService.clearCache();
        console.log('🗑️ Order cache cleared (error recovery)');
      } catch (cacheError) {
        console.warn('Failed to clear order cache during error recovery:', cacheError);
      }
      setUser(null);
      clearUserCache(); // Clear user cache from both localStorage and cookies
      localStorage.clear(); // Clear all localStorage to remove any other cached data
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('Manual auth refresh requested...');
      setLoading(true);
      
      // Force an auth check
      await checkAuthState(true);
      
    } catch (error) {
      console.error('Manual auth refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Super admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    signup,
    logout,
    refreshAuth,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};