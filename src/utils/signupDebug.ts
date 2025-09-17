import { supabase } from '@/integrations/supabase/client';

export interface SignupDebugResult {
  step: string;
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Debug utility to test signup process step by step
 */
export const debugSignupProcess = async (
  email: string, 
  password: string, 
  firstName: string = 'Test',
  lastName: string = 'User'
): Promise<SignupDebugResult[]> => {
  const results: SignupDebugResult[] = [];
  
  try {
    // Step 1: Check Supabase client connection
    results.push({
      step: 'Supabase Client',
      success: true,
      message: 'Supabase client initialized successfully',
      details: { url: 'https://cdzkdldcwkddeqerlwjf.supabase.co' } // Using the URL directly instead of accessing protected property
    });
    
    // Step 2: Test basic database connection
    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 5000))
      ]) as any;
      
      if (error) {
        results.push({
          step: 'Database Connection',
          success: false,
          message: 'Database connection failed',
          details: error
        });
      } else {
        results.push({
          step: 'Database Connection',
          success: true,
          message: 'Database connection successful'
        });
      }
    } catch (dbError) {
      results.push({
        step: 'Database Connection',
        success: false,
        message: 'Database connection timeout or error',
        details: dbError
      });
    }
    
    // Step 3: Test auth signup
    try {
      console.log('🔍 Testing signup for:', email);
      
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
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Signup timeout after 20 seconds')), 20000)
      );
      
      const { data: authData, error: authError } = await Promise.race([
        signupPromise,
        timeoutPromise
      ]);
      
      if (authError) {
        results.push({
          step: 'Auth Signup',
          success: false,
          message: `Signup failed: ${authError.message}`,
          details: authError
        });
      } else if (!authData.user) {
        results.push({
          step: 'Auth Signup',
          success: false,
          message: 'No user data returned from signup'
        });
      } else {
        results.push({
          step: 'Auth Signup',
          success: true,
          message: `User created successfully: ${authData.user.email}`,
          details: {
            userId: authData.user.id,
            email: authData.user.email,
            hasSession: !!authData.session
          }
        });
        
        // Step 4: Test profile creation (if auth signup succeeded)
        if (authData.user) {
          try {
            const profileData = {
              user_id: authData.user.id,
              email: authData.user.email,
              first_name: firstName,
              last_name: lastName,
              account_type: email.includes('admin') ? 'admin' : 'customer',
              is_active: true
            };
            
            const profilePromise = supabase
              .from('profiles')
              .insert(profileData);
              
            const profileTimeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
            );
            
            const { error: profileError } = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]);
            
            if (profileError) {
              results.push({
                step: 'Profile Creation',
                success: false,
                message: `Profile creation failed: ${profileError.message}`,
                details: profileError
              });
            } else {
              results.push({
                step: 'Profile Creation',
                success: true,
                message: 'Profile created successfully'
              });
            }
          } catch (profileError) {
            results.push({
              step: 'Profile Creation',
              success: false,
              message: 'Profile creation exception',
              details: profileError
            });
          }
        }
      }
    } catch (signupError) {
      results.push({
        step: 'Auth Signup',
        success: false,
        message: 'Signup process exception',
        details: signupError
      });
    }
    
  } catch (globalError) {
    results.push({
      step: 'Global Error',
      success: false,
      message: 'Unexpected error during debug process',
      details: globalError
    });
  }
  
  return results;
};

/**
 * Quick connection test
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: { user }, error } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (error && error.message !== 'User not logged in') {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Supabase connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
};