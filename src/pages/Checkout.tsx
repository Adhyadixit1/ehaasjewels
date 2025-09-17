import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Add this import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { AppLoading } from '@/components/AppLoading';
import { OrderProcessingLoader } from '@/components/OrderProcessingLoader';
import OrderService from '@/services/OrderService';
import { supabase } from '@/integrations/supabase/client'; // Add this import

// Track checkout initiation
const trackCheckoutInitiation = async () => {
  try {
    // Get session ID from localStorage
    const sessionId = typeof window !== 'undefined' ? 
      localStorage.getItem('visitor_session_id') : null;
    
    console.log('Tracking checkout initiation:', { sessionId });
    
    if (sessionId) {
      // Increment checkout initiations
      const params = {
        p_session_id: sessionId
      };
      
      console.log('Calling increment_checkout_initiations with params:', params);
      
      const { error } = await supabase.rpc('increment_checkout_initiations', params);
      
      if (error) {
        console.error('Error tracking checkout initiation:', error);
        console.error('Session ID:', sessionId);
        // Try to get more detailed error information
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Checkout initiation tracked successfully');
      }
    } else {
      console.warn('No session ID found for checkout initiation tracking');
    }
  } catch (error) {
    console.error('Error tracking checkout initiation:', error);
    // Log more detailed error information if available
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
};

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

interface PaymentInfo {
  method: 'cod';
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getTotalPrice, getDiscountAmount, getFinalTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ method: 'cod' });
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showOrderLoader, setShowOrderLoader] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasTrackedInitiation = useRef(false);

  // Track checkout initiation on component mount
  useEffect(() => {
    if (!hasTrackedInitiation.current) {
      trackCheckoutInitiation();
      hasTrackedInitiation.current = true;
    }
  }, []);

  // Validate form fields in real-time
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (shippingInfo.fullName.trim() === '' && shippingInfo.fullName.length > 0) {
      errors.fullName = 'Full name is required';
    }
    
    if (shippingInfo.phone.length > 0 && shippingInfo.phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    if (shippingInfo.pincode.length > 0 && shippingInfo.pincode.length !== 6) {
      errors.pincode = 'PIN code must be exactly 6 digits';
    }
    
    if (shippingInfo.city.trim() === '' && shippingInfo.city.length > 0) {
      errors.city = 'City is required';
    }
    
    if (shippingInfo.state.trim() === '' && shippingInfo.state.length > 0) {
      errors.state = 'State is required';
    }
    
    if (shippingInfo.address.trim() === '' && shippingInfo.address.length > 0) {
      errors.address = 'Address is required';
    }
    
    setErrors(errors);
  }, [shippingInfo]);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  // Add a debounce timer for PIN code API calls
  const pincodeDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Function to fetch city and state based on PIN code
  const fetchLocationByPincode = async (pincode: string) => {
    // Clear previous timer
    if (pincodeDebounceTimer.current) {
      clearTimeout(pincodeDebounceTimer.current);
    }
    
    // Set new timer with 500ms delay
    pincodeDebounceTimer.current = setTimeout(async () => {
      setIsFetchingLocation(true);
      try {
        // Using Postcode API to fetch location details
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          // Try different fields for city and state
          const city = postOffice.District || postOffice.Block || postOffice.Division || postOffice.Name || '';
          const state = postOffice.State || '';
          
          setShippingInfo(prev => ({
            ...prev,
            city: city,
            state: state
          }));
        } else {
          // If API doesn't return valid data, it's okay - user can enter manually
          console.log('PIN code not found in database or API returned no data');
        }
      } catch (error) {
        console.error('Error fetching location by PIN code:', error);
        // Don't show error to user, just let them enter manually
      } finally {
        setIsFetchingLocation(false);
      }
    }, 500);
  };

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (pincodeDebounceTimer.current) {
        clearTimeout(pincodeDebounceTimer.current);
      }
    };
  });
  
  // Load user profile data when authenticated
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('user_id', user.id)
            .single();
          
          if (profile && !error) {
            setShippingInfo(prev => ({
              ...prev,
              fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              email: profile.email || '',
              phone: profile.phone || ''
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    
    loadUserProfile();
  }, [isAuthenticated, user]);

  // Focus on PIN code field when component mounts
  useEffect(() => {
    const pincodeField = document.getElementById('pincode');
    if (pincodeField) {
      pincodeField.focus();
    }
  }, []);

  // Function to check if shipping form is valid
  const isShippingFormValid = () => {
    return (
      shippingInfo.fullName.trim() !== '' &&
      shippingInfo.phone.length === 10 &&
      shippingInfo.address.trim() !== '' &&
      shippingInfo.city.trim() !== '' &&
      shippingInfo.state.trim() !== '' &&
      shippingInfo.pincode.length === 6
    );
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for any validation errors
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      alert('Please fix the validation errors before continuing');
      return;
    }
    
    // Additional validation for required fields
    if (!isShippingFormValid()) {
      alert('Please fill in all required fields correctly');
      return;
    }
    
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  // Function to create a guest user with provided password
  const createGuestUserWithPassword = async (email: string, password: string) => {
    try {
      // Sign up the guest user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: shippingInfo.fullName.split(' ')[0] || 'Guest',
            last_name: shippingInfo.fullName.split(' ').slice(1).join(' ') || 'User'
          }
        }
      });

      if (error) {
        console.error('Error creating guest user:', error);
        // If signup fails, we'll proceed with anonymous order
        return null;
      }

      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create profile for the guest user with better error handling
      if (data.user) {
        try {
          // Try to create the profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              first_name: shippingInfo.fullName.split(' ')[0] || 'Guest',
              last_name: shippingInfo.fullName.split(' ').slice(1).join(' ') || 'User',
              account_type: 'customer',
              is_active: true
            })
            .select()
            .single();

          if (profileError) {
            console.error('Error creating guest profile:', profileError);
            // Even if profile creation fails, we can still use the user ID for the order
            return data.user.id;
          }

          console.log('Guest profile created successfully:', profileData);
          return data.user.id;
        } catch (profileError) {
          console.error('Exception creating guest profile:', profileError);
          // Even if profile creation fails, we can still use the user ID for the order
          return data.user.id;
        }
      }

      return null;
    } catch (error) {
      console.error('Exception creating guest user:', error);
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    setShowOrderLoader(true);
    
    try {
      let userId = 'anonymous';
      let guestPassword = '';
      
      // If user is not authenticated, try to create a guest user
      let actualGuestEmail = '';
      if (!isAuthenticated) {
        // Generate a guest email if none provided
        actualGuestEmail = shippingInfo.email || `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@ehsaasjewellery.com`;
        
        // Generate a password and store it for authentication
        guestPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        const createdGuestUserId = await createGuestUserWithPassword(actualGuestEmail, guestPassword);
        
        if (createdGuestUserId) {
          userId = createdGuestUserId;
        }
      } else {
        // Use authenticated user's ID
        userId = user?.id || 'anonymous';
      }
      
      // Create order data with discount
      const subtotal = getTotalPrice();
      const discountAmount = getDiscountAmount();
      const finalTotal = getFinalTotal();
      
      const orderData = {
        orderNumber: 'EJ' + Date.now().toString().slice(-8),
        userId: userId,
        status: 'confirmed' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: 'cod',
        subtotal: subtotal,
        discountAmount: discountAmount,
        total: finalTotal,
        currency: 'INR'
      };

      // Create order items from cart
      const orderItems = cartItems.map(item => ({
        productId: parseInt(item.id),
        productName: item.name,
        productSku: 'N/A', // CartItem doesn't have sku property
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        size: item.size || undefined,
        color: item.color || undefined
      }));

      // Use OrderService to create the actual order with shipping information
      const createdOrder = await OrderService.createOrder(orderData, orderItems, shippingInfo);
      
      // Auto-authenticate guest user after order creation
      // Only run if user is not already authenticated and we have valid guest credentials
      if (!isAuthenticated && guestPassword && userId !== 'anonymous' && actualGuestEmail && !user) {
        try {
          console.log('🔑 Attempting guest auto-authentication for:', actualGuestEmail);
          // Sign in the guest user with their actual email and password
          const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email: actualGuestEmail,
            password: guestPassword
          });
          
          if (signInError) {
            console.warn('Guest auto-authentication failed:', signInError);
          } else if (session) {
            console.log('✅ Guest user auto-authenticated successfully');
            // Force a refresh of the auth state to ensure consistency
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for auth state to settle
          }
        } catch (authError) {
          console.warn('Guest auto-authentication exception:', authError);
        }
      } else if (isAuthenticated) {
        console.log('🔑 User already authenticated, skipping guest auto-authentication');
      }
      
      // Clear cart
      clearCart();
      
      // Ensure authentication state is stable before navigation
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for any auth operations to complete
      
      // Hide loader and navigate to confirmation
      setShowOrderLoader(false);
      
      // Use a small delay before navigation to ensure auth state is stable
      setTimeout(() => {
        navigate(`/order-confirmation/${createdOrder.id}`);
      }, 100);
    } catch (error) {
      console.error('Order creation failed:', error);
      // Handle error appropriately
      setShowOrderLoader(false);
    }
  };

  const renderShippingForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={shippingInfo.fullName}
                onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                required
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) => {
                  // Allow only numbers and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setShippingInfo({...shippingInfo, phone: value});
                }}
                required
                minLength={10}
                maxLength={10}
                placeholder="10-digit mobile number"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
              placeholder="Optional - Leave blank for guest checkout"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {shippingInfo.email 
                ? "We'll send your order confirmation to this email" 
                : ""}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <div className="relative">
                <Input
                  id="pincode"
                  value={shippingInfo.pincode}
                  onChange={(e) => {
                    // Allow only numbers and limit to 6 digits for Indian PIN codes
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setShippingInfo({...shippingInfo, pincode: value});
                    
                    // Clear city and state when PIN code changes
                    if (value.length !== 6) {
                      setShippingInfo(prev => ({
                        ...prev,
                        city: '',
                        state: ''
                      }));
                    }
                    
                    // Fetch city and state when PIN code is complete
                    if (value.length === 6) {
                      fetchLocationByPincode(value);
                    }
                  }}
                  required
                  minLength={6}
                  maxLength={6}
                  placeholder="6-digit PIN code"
                  className={errors.pincode ? 'border-red-500' : ''}
                />
                {isFetchingLocation && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {errors.pincode && (
                <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                required
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={shippingInfo.state}
                onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                required
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
              required
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={shippingInfo.landmark}
              onChange={(e) => setShippingInfo({...shippingInfo, landmark: e.target.value})}
              placeholder="Near railway station, opposite hospital, etc."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Helps delivery person locate your address easily
            </p>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!isShippingFormValid()}
          >
            Proceed
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderPaymentForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <RadioGroup
            value={paymentInfo.method}
            onValueChange={(value) => setPaymentInfo({...paymentInfo, method: value as any})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>
          </RadioGroup>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep('shipping')}
              className="flex-1"
            >
              Back to Shipping
            </Button>
            <Button type="submit" className="flex-1">
              Review Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderOrderReview = () => (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  {/* Display all variant information prominently */}
                  {Object.keys(item).filter(key => 
                    key !== 'id' && 
                    key !== 'name' && 
                    key !== 'price' && 
                    key !== 'originalPrice' && 
                    key !== 'image' && 
                    key !== 'quantity' &&
                    item[key as keyof typeof item]
                  ).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.keys(item).map(key => {
                        // Skip non-variant properties
                        if (key === 'id' || key === 'name' || key === 'price' || 
                            key === 'originalPrice' || key === 'image' || key === 'quantity') {
                          return null;
                        }
                        
                        // Only display properties that have values
                        const value = item[key as keyof typeof item];
                        if (!value) return null;
                        
                        // Format the property name (capitalize first letter)
                        const formattedName = key.charAt(0).toUpperCase() + key.slice(1);
                        
                        return (
                          <span 
                            key={key} 
                            className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {formattedName}: {String(value)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p className="font-medium">{shippingInfo.fullName}</p>
            <p>{shippingInfo.address}</p>
            {shippingInfo.landmark && <p>Landmark: {shippingInfo.landmark}</p>}
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}</p>
            <p>{shippingInfo.phone}</p>
            <p>{shippingInfo.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Cash on Delivery
          </p>
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(getDiscountAmount())}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-luxury">{formatPrice(getFinalTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('payment')}
          className="flex-1"
        >
          Back to Payment
        </Button>
        <Button 
          onClick={handlePlaceOrder}
          disabled={showOrderLoader}
          className="flex-1 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          {showOrderLoader ? (
            <div className="flex items-center justify-center">
              <AppLoading message="Processing..." size="sm" />
            </div>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
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
                onClick={() => navigate('/cart')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-luxury">Checkout</h1>
            </div>
            <div className="mr-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">Secure</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          {['shipping', 'payment', 'review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-primary text-primary-foreground' 
                  : index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'bg-green-600'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'shipping' && renderShippingForm()}
          {currentStep === 'payment' && renderPaymentForm()}
          {currentStep === 'review' && renderOrderReview()}
        </motion.div>
      </div>
      
      {/* Order Processing Loader */}
      <OrderProcessingLoader 
        isOpen={showOrderLoader}
        onComplete={() => {
          // Loader completed, navigation will be handled by handlePlaceOrder
        }}
      />
    </div>
  );
};

export default Checkout;