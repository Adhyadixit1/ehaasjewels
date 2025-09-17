import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { useEffect } from 'react';

const TermsOfUse = () => {
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
            <h1 className="text-xl font-bold text-luxury">Terms of Use</h1>
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
            <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                By accessing and using the एहसास (Ehsaas) website and mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Eligibility</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You must be at least 18 years old to use our services. By using our platform, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into binding agreements</li>
                <li>Your use of the service will not violate any applicable law or regulation</li>
                <li>All information you provide is accurate and truthful</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. User Accounts</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Safeguarding your account password and login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Promptly notifying us of any unauthorized use of your account</li>
                <li>Maintaining accurate and up-to-date account information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Products and Services</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>All products and services offered through our platform are subject to availability. We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Limit the quantities of products or services available for purchase</li>
                <li>Discontinue any product or service at any time</li>
                <li>Refuse service to anyone for any reason at any time</li>
                <li>Modify product descriptions, prices, and availability without prior notice</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Orders and Payment</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Order Acceptance</h3>
              <p>Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order for any reason.</p>
              
              <h3 className="font-semibold text-foreground mt-4">Pricing</h3>
              <p>All prices are listed in Indian Rupees (INR) and are subject to change without notice. We strive to display accurate pricing information, but errors may occur.</p>
              
              <h3 className="font-semibold text-foreground mt-4">Payment</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Payment must be made at the time of order placement</li>
                <li>We accept various payment methods as displayed during checkout</li>
                <li>All payments are processed securely through our payment partners</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Prohibited Uses</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You may not use our service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To collect or track the personal information of others</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Intellectual Property</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>The service and its original content, features, and functionality are and will remain the exclusive property of एहसास (Ehsaas) and its licensors. The service is protected by copyright, trademark, and other laws.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Disclaimer of Warranties</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>In no case shall एहसास (Ehsaas), our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Governing Law</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>These Terms shall be interpreted and governed in accordance with the laws of India. Any disputes relating to these Terms will be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">11. Changes to Terms</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">12. Contact Information</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>If you have any questions about these Terms of Use, please contact us:</p>
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

export default TermsOfUse;