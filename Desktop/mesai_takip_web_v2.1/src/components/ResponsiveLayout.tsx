// Responsive layout component with mobile-first design

import React from 'react'
import { useResponsive, Breakpoint } from '../hooks/useResponsive'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: Breakpoint
  centered?: boolean
}

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: Partial<Record<Breakpoint, number>>
  gap?: Partial<Record<Breakpoint, number>>
}

interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: Partial<Record<Breakpoint, 'row' | 'col' | 'row-reverse' | 'col-reverse'>>
  justify?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>>
  align?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch' | 'baseline'>>
  wrap?: boolean
  gap?: Partial<Record<Breakpoint, number>>
}

// Main responsive layout component
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const { breakpoint } = useResponsive()

  const getLayoutClasses = (bp: Breakpoint): string => {
    const baseClasses = 'min-h-screen bg-gray-50 dark:bg-gray-900'
    
    switch (bp) {
      case 'xs':
        return `${baseClasses} px-4 py-3`
      case 'sm':
        return `${baseClasses} px-6 py-4`
      case 'md':
        return `${baseClasses} px-8 py-6`
      case 'lg':
        return `${baseClasses} px-12 py-8`
      case 'xl':
        return `${baseClasses} px-16 py-10`
      case '2xl':
        return `${baseClasses} px-20 py-12`
      default:
        return baseClasses
    }
  }

  return (
    <div className={`${getLayoutClasses(breakpoint)} ${className}`}>
      {children}
    </div>
  )
}

// Responsive container
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '',
  size,
  centered = false 
}) => {
  const { breakpoint } = useResponsive()

  const getContainerClasses = (bp: Breakpoint): string => {
    let classes = 'w-full'
    
    if (size) {
      const maxWidthClasses: Record<Breakpoint, string> = {
        xs: 'max-w-full',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
      }
      classes += ` ${maxWidthClasses[size]}`
    } else {
      // Responsive max-width based on breakpoint
      const maxWidthClasses: Record<Breakpoint, string> = {
        xs: 'max-w-full',
        sm: 'max-w-lg',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        '2xl': 'max-w-7xl'
      }
      classes += ` ${maxWidthClasses[bp]}`
    }
    
    if (centered) {
      classes += ' mx-auto'
    }
    
    return classes
  }

  return (
    <div className={`${getContainerClasses(breakpoint)} ${className}`}>
      {children}
    </div>
  )
}

// Responsive grid
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = { xs: 2, sm: 3, md: 4, lg: 6, xl: 8, '2xl': 10 }
}) => {
  const { breakpoint } = useResponsive()

  const getGridClasses = (bp: Breakpoint): string => {
    const col = cols[bp] || 1
    const g = gap[bp] || 2
    
    return `grid grid-cols-${col} gap-${g}`
  }

  return (
    <div className={`${getGridClasses(breakpoint)} ${className}`}>
      {children}
    </div>
  )
}

// Responsive flex
export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({ 
  children, 
  className = '',
  direction = { xs: 'col', sm: 'row' },
  justify = { xs: 'start', sm: 'between' },
  align = { xs: 'start', sm: 'center' },
  wrap = false,
  gap = { xs: 2, sm: 4 }
}) => {
  const { breakpoint } = useResponsive()

  const getFlexClasses = (bp: Breakpoint): string => {
    const dir = direction[bp] || 'row'
    const just = justify[bp] || 'start'
    const ali = align[bp] || 'stretch'
    const g = gap[bp] || 2

    const directionClasses: Record<string, string> = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    }

    const justifyClasses: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    const alignClasses: Record<string, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }

    let classes = `flex ${directionClasses[dir]} ${justifyClasses[just]} ${alignClasses[ali]} gap-${g}`
    
    if (wrap) {
      classes += ' flex-wrap'
    }

    return classes
  }

  return (
    <div className={`${getFlexClasses(breakpoint)} ${className}`}>
      {children}
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: Partial<Record<Breakpoint, string>>
  weight?: Partial<Record<Breakpoint, string>>
  align?: Partial<Record<Breakpoint, string>>
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({ 
  children, 
  className = '',
  size = { xs: 'sm', sm: 'base', md: 'lg', lg: 'xl', xl: '2xl', '2xl': '3xl' },
  weight = { xs: 'normal', sm: 'medium' },
  align = { xs: 'left', sm: 'center' }
}) => {
  const { breakpoint } = useResponsive()

  const getTextClasses = (bp: Breakpoint): string => {
    const s = size[bp] || 'base'
    const w = weight[bp] || 'normal'
    const a = align[bp] || 'left'

    const sizeClasses: Record<string, string> = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    }

    const weightClasses: Record<string, string> = {
      thin: 'font-thin',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black'
    }

    const alignClasses: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    }

    return `${sizeClasses[s]} ${weightClasses[w]} ${alignClasses[a]}`
  }

  return (
    <div className={`${getTextClasses(breakpoint)} ${className}`}>
      {children}
    </div>
  )
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  size?: Partial<Record<Breakpoint, number>>
  direction?: 'vertical' | 'horizontal' | 'both'
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({ 
  size = { xs: 2, sm: 4, md: 6, lg: 8, xl: 10, '2xl': 12 },
  direction = 'vertical'
}) => {
  const { breakpoint } = useResponsive()
  const s = size[breakpoint] || 4

  const getSpacingClasses = (): string => {
    switch (direction) {
      case 'vertical':
        return `py-${s}`
      case 'horizontal':
        return `px-${s}`
      case 'both':
        return `p-${s}`
      default:
        return `p-${s}`
    }
  }

  return <div className={getSpacingClasses()} />
}
