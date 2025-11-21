import React, { createContext, useContext, useState, useEffect } from 'react';
import { CleanupManager } from '../utils/cleanupManager';
import { useResponsive } from '../hooks/useResponsive';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const cleanupManager = new CleanupManager();
  const { isMobile, isTablet } = useResponsive();

  // Auto-collapse on mobile/tablet
  useEffect(() => {
    if (isMobile || isTablet) {
      setIsCollapsed(true);
      setIsMobileOpen(false);
    }
  }, [isMobile, isTablet]);

  // Handle window resize with cleanup manager
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) { // Mobile breakpoint
        setIsCollapsed(true);
        setIsMobileOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener with cleanup manager
    cleanupManager.addEventListener(window, 'resize', handleResize);

    // Cleanup on unmount
    return () => {
      cleanupManager.cleanup();
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggleSidebar,
      isMobileOpen,
      closeMobileSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
};