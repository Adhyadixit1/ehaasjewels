import { supabase } from '@/integrations/supabase/client';

export class AuthService {
  /**
   * Create a test admin user for development
   */
  static async createTestAdminUser() {
    try {
      // First, try to sign up a test admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@ehsaas.com',
        password: 'admin123456',
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      console.log('Test admin user created/exists:', signUpData.user?.email);
      return signUpData.user;
    } catch (error) {
      console.error('Error creating test admin user:', error);
      throw error;
    }
  }

  /**
   * Sign in the admin user
   */
  static async signInAdmin() {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@ehsaas.com',
        password: 'admin123456'
      });

      if (error) {
        throw error;
      }

      console.log('Admin signed in successfully:', data.user?.email);
      
      // Create profile if it doesn't exist
      if (data.user) {
        await this.ensureProfile(data.user);
      }

      return data.user;
    } catch (error) {
      console.error('Error signing in admin:', error);
      throw error;
    }
  }

  /**
   * Ensure user profile exists
   */
  static async ensureProfile(user: any) {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || 'Admin',
            last_name: user.user_metadata?.last_name || 'User',
            account_type: 'admin',
            is_active: true
          });

        if (error) {
          console.error('Error creating profile:', error);
        } else {
          console.log('Admin profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export default AuthService;