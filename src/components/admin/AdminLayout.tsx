import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="h-screen w-full max-w-full overflow-hidden bg-background relative">
      {/* Fixed Header - completely outside of flex containers */}
      <AdminHeader 
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onToggleMobileMenu={toggleMobileMenu}
        mobileMenuOpen={mobileMenuOpen}
      />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full pt-16 w-full max-w-full"> {/* Add padding-top for header height */}
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={toggleSidebar}
        />
        <div className="flex-1 flex flex-col w-full max-w-full">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 w-full max-w-full">
            <main className="p-6 w-full max-w-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen w-full max-w-full overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div 
          className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-[9999] transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <AdminSidebar 
            isCollapsed={false} 
            onToggleCollapse={() => {}}
            isMobile={true}
            onCloseMobile={toggleMobileMenu}
          />
        </div>
        
        {/* Mobile Content */}
        <div className="flex-1 flex flex-col w-full max-w-full min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 w-full max-w-full">
            <main className="p-4 w-full max-w-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}