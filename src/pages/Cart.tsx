import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import CartUpsell from '@/components/cart/CartUpsell';
import CartProgressBar from '@/components/cart/CartProgressBar';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, getDiscountAmount, getFinalTotal } = useCart();
  const [activeTab, setActiveTab] = useState('Home');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
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
                <h1 className="text-xl font-bold text-luxury">Shopping Cart</h1>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Empty Cart */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-center mb-6">
            Discover amazing jewelry pieces and add them to your cart
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <h1 className="text-xl font-bold text-luxury">Shopping Cart</h1>
            </div>
            <div className="mr-3">
              <span className="text-sm text-muted-foreground">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Cart Items */}
      <main className="px-4 py-6">
        {/* Progress Bar */}
        <CartProgressBar />
        
        <div className="space-y-1 mb-2">
          {cartItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-2">
                  <div className="flex gap-2">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-xs mb-0.5 truncate">{item.name}</h3>
                      {/* Variant Display - Always Visible */}
                      <div className="mb-1 text-[10px] text-black font-medium">
                        {item.variantName && item.variantName !== '' ? (
                          item.variantName
                        ) : (
                          <span>Gold • 18k • Size 7</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-luxury">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through ml-1">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 p-0 min-w-6"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </Button>
                          <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 p-0 min-w-6"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 p-0 text-destructive hover:text-destructive min-w-6"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upsell Section */}
        <CartUpsell cartItems={cartItems} />

        {/* Price Summary */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-luxury">{formatPrice(getFinalTotal())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Button */}
        <Button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary hover:bg-primary/90 text-white py-1.5 text-sm font-semibold mb-1 sticky bottom-24 z-30"
        >
          Proceed to Checkout
        </Button>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Cart;