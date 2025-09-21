import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Store,
  MessageSquare,
  Truck,
  AlertTriangle,
  FileText,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/admin/products', icon: Package },
      { name: 'Add Product', href: '/admin/products/add', icon: Package },
      { name: 'Categories', href: '/admin/products/categories', icon: Package },
      { name: 'Product Images', href: '/admin/products/images', icon: Image },
      { name: 'Specifications', href: '/admin/products/specifications', icon: FileText },
    ]
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 5, // This would come from actual data
    children: [
      { name: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Pending Orders', href: '/admin/orders/pending', icon: ShoppingCart },
      { name: 'Shipped Orders', href: '/admin/orders/shipped', icon: Truck },
      { name: 'Refunds', href: '/admin/orders/refunds', icon: ShoppingCart },
    ]
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    children: [
      { name: 'All Customers', href: '/admin/customers', icon: Users },
      { name: 'Customer Reviews', href: '/admin/customers/reviews', icon: MessageSquare },
    ]
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Sales Reports', href: '/admin/analytics/sales', icon: BarChart3 },
      { name: 'Product Analytics', href: '/admin/analytics/products', icon: BarChart3 },
      { name: 'Visitor Tracking', href: '/admin/analytics/visitors', icon: BarChart3 },
      { name: 'Time Analytics', href: '/admin/time-analytics', icon: BarChart3 },
    ]
  },
  {
    name: 'Alerts',
    href: '/admin/alerts',
    icon: AlertTriangle,
    badge: 3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/admin/settings', icon: Settings },
      { name: 'Admin Users', href: '/admin/settings/users', icon: Users },
      { name: 'Permissions', href: '/admin/settings/permissions', icon: Settings },
      { name: 'System Logs', href: '/admin/settings/logs', icon: FileText },
    ]
  },
];

export function AdminSidebar({ isCollapsed, onToggleCollapse, isMobile, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const isChildActive = (children: NavigationItem[]) => {
    return children.some(child => isActive(child.href));
  };

  return (
    <motion.aside
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      className="bg-card border-r border-border h-screen sticky top-0 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-luxury" />
              <span className="font-bold text-lg brand-name text-luxury">एहसास</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            <div className="relative">
              <Link
                to={item.href}
                onClick={(e) => {
                  if (item.children) {
                    toggleExpanded(item.name);
                  } else if (isMobile && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.href) || (item.children && isChildActive(item.children))
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.children && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.name) ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </>
                )}
              </Link>
            </div>

            {/* Submenu */}
            {!isCollapsed && item.children && (
              <AnimatePresence>
                {expandedItems.includes(item.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-8 mt-1 space-y-1"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        onClick={() => {
                          if (isMobile && onCloseMobile) {
                            onCloseMobile();
                          }
                        }}
                        className={`
                          block px-3 py-2 rounded-md text-sm transition-colors
                          ${isActive(child.href)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Separator className="mb-4" />
        <div className="space-y-2">
          <Link
            to="/admin/notifications"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5" />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => {
              // Handle logout
              console.log('Logging out...');
            }}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}