import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { useEffect } from 'react';

const RefundPolicy = () => {
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
            <h1 className="text-xl font-bold text-luxury">Refund Policy</h1>
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
            <h2 className="text-xl font-bold text-foreground mb-4">1. Refund Eligibility</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We want you to be completely satisfied with your jewelry purchase. You may be eligible for a refund under the following conditions:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Item must be returned within 30 days of delivery</li>
                <li>Item must be in original condition, unworn, and undamaged</li>
                <li>Original packaging, tags, and certificates must be included</li>
                <li>Custom or personalized items are not eligible for refund</li>
                <li>Sale or clearance items may have different refund conditions</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Non-Refundable Items</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>The following items cannot be refunded:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Custom-made or personalized jewelry</li>
                <li>Engraved items</li>
                <li>Earrings (for hygiene reasons)</li>
                <li>Items damaged by misuse or normal wear</li>
                <li>Items purchased with special promotional codes (unless otherwise stated)</li>
                <li>Gift cards and digital products</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Refund Process</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Step 1: Initiate Return Request</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Contact our customer service team at refunds@ehsaas.com</li>
                <li>Provide your order number and reason for refund</li>
                <li>Attach clear photos of the item if there are quality issues</li>
              </ul>

              <h3 className="font-semibold text-foreground">Step 2: Return Authorization</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We will review your request within 2-3 business days</li>
                <li>If approved, you'll receive a return authorization number</li>
                <li>Return shipping instructions will be provided</li>
              </ul>

              <h3 className="font-semibold text-foreground">Step 3: Ship the Item</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Package the item securely in original packaging</li>
                <li>Include all original accessories and documentation</li>
                <li>Use the provided return shipping label</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Refund Timeline</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Once we receive your returned item:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Inspection:</strong> 3-5 business days to inspect the returned item</li>
                <li><strong>Processing:</strong> 2-3 business days to process the refund</li>
                <li><strong>Credit:</strong> 5-10 business days for refund to appear in your account</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Refund timeline may vary depending on your payment method and bank processing times.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Refund Methods</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Refunds will be processed using the same payment method used for the original purchase:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>UPI/Digital Wallets:</strong> 3-7 business days</li>
                <li><strong>Net Banking:</strong> 5-10 business days</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer to provided account details</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Partial Refunds</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Partial refunds may be granted for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Items with obvious signs of use or wear</li>
                <li>Items returned without original packaging</li>
                <li>Items returned after the 30-day return window</li>
                <li>Items missing accessories or documentation</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Shipping Costs</h2>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Defective Items:</strong> We cover all return shipping costs</li>
                <li><strong>Change of Mind:</strong> Customer responsible for return shipping</li>
                <li><strong>Wrong Item Sent:</strong> We cover all return shipping costs</li>
                <li><strong>Original Shipping:</strong> Non-refundable unless item was defective</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Quality Guarantee</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We stand behind the quality of our jewelry. If you receive a defective item:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Full refund will be processed immediately upon return</li>
                <li>No questions asked within the first 7 days of delivery</li>
                <li>We will cover all shipping costs for defective items</li>
                <li>Option to exchange for a replacement item</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Damaged in Transit</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>If your item arrives damaged:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Contact us within 48 hours of delivery</li>
                <li>Provide photos of the damaged item and packaging</li>
                <li>We will arrange immediate replacement or full refund</li>
                <li>No need to return the damaged item</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Contact for Refunds</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>For any refund-related queries, please contact us:</p>
              <ul className="space-y-1">
                <li><strong>Registered Company:</strong> urban lalten</li>
                <li><strong>Brand Name:</strong> Ehsaas</li>
                <li><strong>Email:</strong> info@dreampathsolutions.in</li>
                <li><strong>Phone:</strong> +91 7567068138</li>
                <li><strong>WhatsApp:</strong> +91 7567068138</li>
                <li><strong>Support Hours:</strong> Monday to Saturday, 10 AM to 7 PM IST</li>
              </ul>
            </div>
          </section>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default RefundPolicy;