// Mobile responsive hook for responsive design

import { useState, useEffect } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ResponsiveValues {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  breakpoint: Breakpoint
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

const breakpointValues: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export const useResponsive = (): ResponsiveValues => {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
      }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener with throttling for performance
    let resizeTimer: NodeJS.Timeout
    const throttledHandleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', throttledHandleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', throttledHandleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpointValues['2xl']) return '2xl'
    if (width >= breakpointValues.xl) return 'xl'
    if (width >= breakpointValues.lg) return 'lg'
    if (width >= breakpointValues.md) return 'md'
    if (width >= breakpointValues.sm) return 'sm'
    return 'xs'
  }

  const breakpoint = getBreakpoint(windowSize.width)
  const isMobile = windowSize.width < breakpointValues.md
  const isTablet = windowSize.width >= breakpointValues.md && windowSize.width < breakpointValues.lg
  const isDesktop = windowSize.width >= breakpointValues.lg
  const isLargeDesktop = windowSize.width >= breakpointValues.xl
  const orientation = windowSize.height > windowSize.width ? 'portrait' : 'landscape'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
    width: windowSize.width,
    height: windowSize.height,
    orientation,
  }
}

// Responsive utility functions
export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint
): T | undefined => {
  const breakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpoints.indexOf(currentBreakpoint)
  
  for (let i = currentIndex; i < breakpoints.length; i++) {
    const bp = breakpoints[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return undefined
}

// Hook for responsive values
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const { breakpoint } = useResponsive()
  return getResponsiveValue(values, breakpoint)
}
