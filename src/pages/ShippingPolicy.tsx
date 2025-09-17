import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { useEffect } from 'react';

const ShippingPolicy = () => {
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
            <h1 className="text-xl font-bold text-luxury">Shipping Policy</h1>
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
            <h2 className="text-xl font-bold text-foreground mb-4">1. Shipping Coverage</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Domestic Shipping (India)</h3>
              <p>We ship to all states and union territories across India including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All major cities and metro areas</li>
                <li>Tier 2 and Tier 3 cities</li>
                <li>Rural areas with PIN code coverage</li>
                <li>Union territories including Delhi, Chandigarh, Puducherry</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">International Shipping</h3>
              <p>We currently ship to selected countries:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>United States, Canada</li>
                <li>United Kingdom, European Union</li>
                <li>Australia, New Zealand</li>
                <li>UAE, Saudi Arabia, Qatar</li>
                <li>Singapore, Malaysia</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Delivery Timeframes</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Standard Delivery (India)</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Metro Cities:</strong> 2-3 business days</li>
                <li><strong>Major Cities:</strong> 3-5 business days</li>
                <li><strong>Other Cities:</strong> 5-7 business days</li>
                <li><strong>Remote Areas:</strong> 7-10 business days</li>
              </ul>

              <h3 className="font-semibold text-foreground">Express Delivery (India)</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Metro Cities:</strong> Next business day</li>
                <li><strong>Major Cities:</strong> 1-2 business days</li>
                <li><strong>Select Cities:</strong> 2-3 business days</li>
                <li><strong>Additional Charges:</strong> ₹200-500 depending on location</li>
              </ul>

              <h3 className="font-semibold text-foreground">International Delivery</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>USA/Canada:</strong> 7-14 business days</li>
                <li><strong>Europe/UK:</strong> 10-15 business days</li>
                <li><strong>Middle East:</strong> 5-10 business days</li>
                <li><strong>Asia Pacific:</strong> 7-12 business days</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Shipping Costs</h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Domestic Shipping Rates</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Free Shipping:</strong> Orders above ₹2,000</li>
                <li><strong>Standard Shipping:</strong> ₹150 (orders below ₹2,000)</li>
                <li><strong>Express Shipping:</strong> ₹300-500 (regardless of order value)</li>
                <li><strong>Same Day Delivery:</strong> ₹800 (Mumbai, Delhi, Bangalore only)</li>
              </ul>

              <h3 className="font-semibold text-foreground">International Shipping Rates</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>USA/Canada:</strong> Starting from ₹2,500</li>
                <li><strong>Europe/UK:</strong> Starting from ₹3,000</li>
                <li><strong>Middle East:</strong> Starting from ₹2,000</li>
                <li><strong>Asia Pacific:</strong> Starting from ₹2,200</li>
              </ul>
              <p className="mt-2"><strong>Note:</strong> International shipping costs vary by weight, dimensions, and destination. Exact costs calculated at checkout.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Order Processing</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Processing Time</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>In-Stock Items:</strong> 1-2 business days</li>
                <li><strong>Custom/Made-to-Order:</strong> 7-14 business days</li>
                <li><strong>Personalized Items:</strong> 3-7 business days</li>
                <li><strong>Bulk Orders (10+ items):</strong> 5-10 business days</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Order Verification</h3>
              <p>For high-value orders (above ₹50,000), we may require:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Phone verification with registered mobile number</li>
                <li>Identity verification for new customers</li>
                <li>Additional 1-2 days for verification process</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Packaging & Security</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Secure Packaging</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Premium jewelry boxes for all items</li>
                <li>Bubble wrap and protective padding</li>
                <li>Tamper-evident security seals</li>
                <li>Discreet packaging without brand logos (if requested)</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Insurance & Tracking</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All shipments fully insured for declared value</li>
                <li>Real-time tracking for all orders</li>
                <li>SMS and email notifications at each stage</li>
                <li>Signature required for delivery confirmation</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Delivery Options</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Standard Delivery</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Delivery to registered address</li>
                <li>Available Monday to Saturday</li>
                <li>Delivery attempts: 3 times</li>
                <li>Signature required from recipient or authorized person</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Special Delivery Options</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Time Slot Delivery:</strong> Choose preferred 2-hour window</li>
                <li><strong>Sunday Delivery:</strong> Available in major cities (+₹100)</li>
                <li><strong>Office Delivery:</strong> Delivery to workplace address</li>
                <li><strong>Gift Wrapping:</strong> Complimentary for orders above ₹5,000</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Tracking Your Order</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">How to Track</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tracking number sent via SMS and email</li>
                <li>Real-time updates on our website</li>
                <li>Track directly on courier partner's website</li>
                <li>Customer service support for tracking queries</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Tracking Updates</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Order confirmed and being processed</li>
                <li>Order dispatched from warehouse</li>
                <li>Out for delivery</li>
                <li>Delivered and received</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Delivery Issues</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Failed Delivery</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>3 delivery attempts will be made</li>
                <li>Package held at local hub for 7 days</li>
                <li>Customer notified via SMS/email</li>
                <li>Return to sender after 7 days if unclaimed</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Damaged or Missing Packages</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Report within 24 hours of delivery</li>
                <li>Provide photos of damaged packaging</li>
                <li>Immediate replacement or full refund</li>
                <li>Investigation with courier partner</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. International Shipping Details</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Customs & Duties</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Customs duties and taxes are buyer's responsibility</li>
                <li>We declare accurate values on customs forms</li>
                <li>Packages may be delayed for customs clearance</li>
                <li>Some countries may have import restrictions</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4">Required Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Complete address with postal code</li>
                <li>Valid phone number for courier contact</li>
                <li>Email address for tracking updates</li>
                <li>Identification may be required for high-value items</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Shipping Support</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>For shipping-related queries, contact us:</p>
              <ul className="space-y-1">
                <li><strong>Registered Company:</strong> urban lalten</li>
                <li><strong>Brand Name:</strong> Ehsaas</li>
                <li><strong>Email:</strong> info@dreampathsolutions.in</li>
                <li><strong>Phone:</strong> +91 7567068138</li>
                <li><strong>WhatsApp:</strong> +91 7567068138</li>
                <li><strong>Live Chat:</strong> Available on website 10 AM - 7 PM IST</li>
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

export default ShippingPolicy;