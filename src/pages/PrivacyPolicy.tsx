import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { useEffect } from 'react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    // Multiple scroll attempts to overcome Framer Motion animation conflicts
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Scroll after a short delay to handle initial animations
    const timer1 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    
    // Scroll after Framer Motion initial animations should complete
    const timer2 = setTimeout(() => {
      window.scrollTo(0, 0);
      
      // Also try to scroll the main container if it exists
      const mainContainer = document.querySelector('.page-scroll') || 
                           document.querySelector('main') || 
                           document.querySelector('#root') ||
                           document.body;
      if (mainContainer) {
        mainContainer.scrollTop = 0;
        // For modern browsers
        if (mainContainer.scrollTo) {
          mainContainer.scrollTo(0, 0);
        }
      }
      
      // Force scroll on document element as well
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
    }, 50);
    
    // Final scroll attempt after all animations should be done
    const timer3 = setTimeout(() => {
      window.scrollTo(0, 0);
      
      // Also try to scroll the main container if it exists
      const mainContainer = document.querySelector('.page-scroll') || 
                           document.querySelector('main') || 
                           document.querySelector('#root') ||
                           document.body;
      if (mainContainer) {
        mainContainer.scrollTop = 0;
        // For modern browsers
        if (mainContainer.scrollTo) {
          mainContainer.scrollTo(0, 0);
        }
      }
      
      // Force scroll on document element as well
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
    }, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/50"
      >
        <div className="py-3 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-luxury">Privacy Policy</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 py-6"
      >
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-6">
            <strong>Last Updated:</strong> September 11, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Personal Information</h3>
              <p>We collect information you provide directly to us, such as:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name, email address, phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely)</li>
                <li>Account credentials and preferences</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-6">Usage Information</h3>
              <p>We automatically collect information about your interaction with our services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent</li>
                <li>Shopping behavior and preferences</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use collected information to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Personalize your shopping experience</li>
                <li>Improve our products and services</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Information Sharing</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We do not sell or rent your personal information. We may share information with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Service Providers:</strong> Payment processors, shipping companies, analytics providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Data Security</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and employee training</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Your Rights</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Lodge a complaint with data protection authorities</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your preferences and login status</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and ads</li>
                <li>Improve website functionality</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Changes to This Policy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Contact Us</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="space-y-1">
                <li><strong>Registered Company:</strong> urban lalten</li>
                <li><strong>Brand Name:</strong> Ehsaas</li>
                <li><strong>Email:</strong> info@dreampathsolutions.in</li>
                <li><strong>Phone:</strong> +91 7567068138</li>
                <li><strong>Address:</strong> Elements mall office 11, 1st floor, mansarovar, Jaipur, Rajasthan 302017</li>
              </ul>
            </div>
          </section>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;