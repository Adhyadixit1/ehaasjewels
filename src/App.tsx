import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useEffect, useState } from "react";
import { Analytics } from "@/components/Analytics";
import ToastNotification from "@/components/ToastNotification";
import { usePurchaseNotifications } from "@/hooks/usePurchaseNotifications";
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import Reels from "@/pages/Reels";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import Wishlist from "@/pages/Wishlist";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Profile from "@/pages/Profile";
import ProductDetail from "@/pages/ProductDetail";
import { ProductDetailSuspense } from "@/components/ProductDetailSuspense";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import RefundPolicy from "@/pages/RefundPolicy";
import ReturnPolicy from "@/pages/ReturnPolicy";
import ShippingPolicy from "@/pages/ShippingPolicy";
import ContactUs from "@/pages/ContactUs";
import TestAnalytics from "@/pages/TestAnalytics";
import TestFacebookPixel from "@/pages/TestFacebookPixel";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminProductAdd from "@/pages/admin/AdminProductAdd.updated";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminTimeAnalytics from "@/pages/admin/AdminTimeAnalytics";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute, PermissionRoute } from "@/components/admin/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { TimeTracker } from "@/components/TimeTracker";

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top on Reels page
    if (!pathname.includes('/reels')) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

// Route wrapper component with authentication state protection
function RouteWithAuthProtection({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Handle authentication state stability during navigation
    const handleBeforeUnload = () => {
      setIsNavigating(true);
    };

    const handleLoad = () => {
      setIsNavigating(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    // Reset navigation state after route changes
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Analytics>
        <ScrollToTop />
        <RouteWithAuthProtection>
          <PageTransition>
            <Index />
          </PageTransition>
        </RouteWithAuthProtection>
      </Analytics>
    )
  },
  {
    path: "/explore",
    element: (
      <Analytics>
        <ScrollToTop />
        <RouteWithAuthProtection>
          <PageTransition>
            <Explore />
          </PageTransition>
        </RouteWithAuthProtection>
      </Analytics>
    )
  },
  {
    path: "/reels",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Reels />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/orders",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Orders />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/notifications",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Notifications />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/wishlist",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Wishlist />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/cart",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Cart />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/checkout",
    element: (
      <Analytics>
        <ScrollToTop />
        <RouteWithAuthProtection>
          <PageTransition>
            <Checkout />
          </PageTransition>
        </RouteWithAuthProtection>
      </Analytics>
    )
  },
  {
    path: "/order-confirmation/:orderId",
    element: (
      <Analytics>
        <ScrollToTop />
        <RouteWithAuthProtection>
          <PageTransition>
            <OrderConfirmation />
          </PageTransition>
        </RouteWithAuthProtection>
      </Analytics>
    )
  },
  {
    path: "/profile",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <Profile />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/product/:id",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <ProductDetailSuspense />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/privacy-policy",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <PrivacyPolicy />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/terms-of-use",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <TermsOfUse />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/refund-policy",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <RefundPolicy />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/return-policy",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <ReturnPolicy />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/shipping-policy",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <ShippingPolicy />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/contact-us",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <ContactUs />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/test-analytics",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <TestAnalytics />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/test-facebook-pixel",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <TestFacebookPixel />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/admin/login",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <AdminLogin />
        </PageTransition>
      </Analytics>
    )
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "products",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:products"><AdminProducts /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "products/add",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="write:products"><AdminProductAdd /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "products/edit/:id",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="write:products"><AdminProductAdd /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "products/view/:id",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:products"><ProductDetail /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "orders",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:orders"><AdminOrders /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "orders/:orderId",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:orders"><AdminOrderDetail /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "customers",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:users"><AdminUsers /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "analytics",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:analytics"><AdminAnalytics /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "time-analytics",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:analytics"><AdminTimeAnalytics /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      },
      {
        path: "settings",
        element: (
          <Analytics>
            <ScrollToTop />
            <PageTransition>
              <PermissionRoute permission="read:settings"><AdminSettings /></PermissionRoute>
            </PageTransition>
          </Analytics>
        )
      }
    ]
  },
  {
    path: "*",
    element: (
      <Analytics>
        <ScrollToTop />
        <PageTransition>
          <NotFound />
        </PageTransition>
      </Analytics>
    )
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

const App = () => {
  const { currentNotification, isVisible, hideNotification } = usePurchaseNotifications();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <TooltipProvider>
            <ToastNotification 
              message={currentNotification || ''}
              isVisible={isVisible}
              onClose={hideNotification}
            />
            <>
              <TimeTracker />
              <RouterProvider router={router} />
            </>
          </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;