import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { useEffect } from 'react';

const ReturnPolicy = () => {
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
            <h1 className="text-xl font-bold text-luxury">Return Policy</h1>
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
            <h2 className="text-xl font-bold text-foreground mb-4">1. Return Window</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We offer a generous return policy to ensure your complete satisfaction:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Standard Items:</strong> 30 days from delivery date</li>
                <li><strong>Premium Collection:</strong> 45 days from delivery date</li>
                <li><strong>Wedding Collection:</strong> 60 days from delivery date</li>
                <li><strong>Custom Items:</strong> Not eligible for return (unless defective)</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Return period is calculated from the date of delivery, not the order date.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Return Conditions</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Items Must Be:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>In original, unworn condition</li>
                <li>Free from scratches, damage, or signs of wear</li>
                <li>Accompanied by all original tags and labels</li>
                <li>Returned in original packaging and jewelry box</li>
                <li>Include original certificate of authenticity (if applicable)</li>
                <li>Include original receipt or proof of purchase</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-6">Items That Cannot Be Returned:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Earrings (due to hygiene reasons)</li>
                <li>Personalized or engraved jewelry</li>
                <li>Custom-made pieces</li>
                <li>Intimate body jewelry</li>
                <li>Items purchased during flash sales (unless otherwise stated)</li>
                <li>Gift cards and e-vouchers</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. How to Return</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Step 1: Contact Us</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email us at returns@ehsaas.com</li>
                <li>Call our customer service at +91 9876543210</li>
                <li>Use the return form on your account dashboard</li>
                <li>Provide order number and reason for return</li>
              </ul>

              <h3 className="font-semibold text-foreground">Step 2: Return Authorization</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We will send you a Return Merchandise Authorization (RMA) number</li>
                <li>Return instructions and shipping label will be provided</li>
                <li>Authorization is valid for 7 days from issue date</li>
              </ul>

              <h3 className="font-semibold text-foreground">Step 3: Package and Ship</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Place item in original packaging</li>
                <li>Include RMA number on the package</li>
                <li>Use provided return shipping label</li>
                <li>Drop off at designated courier service</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Return Shipping</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Free Return Shipping:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Defective or damaged items</li>
                <li>Wrong item sent by us</li>
                <li>Items not matching description</li>
                <li>Premium collection returns (above ₹10,000)</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Customer Pays Return Shipping:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Change of mind returns</li>
                <li>Size exchange requests</li>
                <li>Color/style preference changes</li>
                <li>Returns under ₹2,000 (₹150 shipping fee)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Return Processing</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Timeline:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Received:</strong> 1-2 days after we receive your return</li>
                <li><strong>Inspection:</strong> 2-3 business days for quality check</li>
                <li><strong>Approval:</strong> 1 business day to approve return</li>
                <li><strong>Refund/Exchange:</strong> 3-7 business days to process</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">What We Check:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Item condition and authenticity</li>
                <li>Completeness of accessories and packaging</li>
                <li>Signs of wear or damage</li>
                <li>Compliance with return policy terms</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Exchange Policy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We offer exchanges for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Size Issues:</strong> Free size exchange within 15 days</li>
                <li><strong>Defective Items:</strong> Immediate replacement or refund</li>
                <li><strong>Different Model:</strong> Price difference may apply</li>
                <li><strong>Color Variation:</strong> Subject to availability</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Exchange Process:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Follow same return process above</li>
                <li>Specify desired exchange item</li>
                <li>Pay/receive price difference if applicable</li>
                <li>New item ships after we receive original</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. International Returns</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>For international customers:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Returns accepted within 14 days of delivery</li>
                <li>Customer responsible for return shipping costs</li>
                <li>Items must clear customs inspection</li>
                <li>Original customs declarations required</li>
                <li>Currency conversion may apply for refunds</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Store Returns</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>If you prefer in-person returns:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Visit our flagship store in Mumbai</li>
                <li>Bring original receipt and item</li>
                <li>Instant inspection and processing</li>
                <li>Immediate refund or exchange available</li>
                <li>Store hours: Monday-Saturday 10 AM - 8 PM</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Return Status Tracking</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Track your return progress:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email notifications at each step</li>
                <li>SMS updates for major milestones</li>
                <li>Account dashboard tracking</li>
                <li>Customer service available for queries</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Questions & Support</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Need help with your return? Contact us:</p>
              <ul className="space-y-1">
                <li><strong>Registered Company:</strong> urban lalten</li>
                <li><strong>Brand Name:</strong> Ehsaas</li>
                <li><strong>Email:</strong> info@dreampathsolutions.in</li>
                <li><strong>Phone:</strong> +91 7567068138</li>
                <li><strong>WhatsApp:</strong> +91 7567068138</li>
                <li><strong>Live Chat:</strong> Available on website 10 AM - 7 PM</li>
                <li><strong>Store Address:</strong> Elements mall office 11, 1st floor, mansarovar, Jaipur, Rajasthan 302017</li>
              </ul>
            </div>
          </section>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;