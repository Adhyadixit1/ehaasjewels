import { motion } from 'framer-motion';
import { X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ContactModal({ isOpen, onClose, onConfirm }: ContactModalProps) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store contact info (you can integrate with your backend here)
    console.log('Contact saved:', { phone, email });
    
    setIsSubmitting(false);
    onConfirm();
  };

  const handleSkip = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-luxury"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Stay Updated!</h3>
            <p className="text-sm text-muted-foreground">Get new designs daily</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-pink-200 bg-opacity-20 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-foreground mb-2">Exclusive Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Daily curated jewelry designs</li>
              <li>• Early access to new collections</li>
              <li>• Personalized recommendations</li>
              <li>• Special member discounts</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 px-4 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={!phone.trim() || isSubmitting}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Get Updates'}
            </button>
          </div>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          We respect your privacy. No spam, unsubscribe anytime.
        </p>
      </motion.div>
    </motion.div>
  );
}