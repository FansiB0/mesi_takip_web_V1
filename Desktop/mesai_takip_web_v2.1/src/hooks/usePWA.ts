// PWA (Progressive Web App) hook for offline functionality

import { useEffect, useState } from 'react'

export interface PWAInfo {
  isSupported: boolean
  isStandalone: boolean
  isInstalled: boolean
  canInstall: boolean
  installPrompt: Event | null
  swUpdate: boolean
  isOnline: boolean
}

export const usePWA = (): PWAInfo => {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isSupported: false,
    isStandalone: false,
    isInstalled: false,
    canInstall: false,
    installPrompt: null,
    swUpdate: false,
    isOnline: navigator.onLine
  })

  useEffect(() => {
    // Check if PWA is supported
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Check if running as PWA
    const isInstalled = isStandalone || (window.navigator as any).standalone

    setPwaInfo(prev => ({
      ...prev,
      isSupported,
      isStandalone,
      isInstalled
    }))

    // Listen for install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaInfo(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e
      }))
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setPwaInfo(prev => ({
        ...prev,
        canInstall: false,
        installPrompt: null,
        isInstalled: true
      }))
    }

    // Listen for service worker updates
    const handleSWUpdate = () => {
      setPwaInfo(prev => ({
        ...prev,
        swUpdate: true
      }))
    }

    // Listen for online/offline status
    const handleOnline = () => {
      setPwaInfo(prev => ({
        ...prev,
        isOnline: true
      }))
    }

    const handleOffline = () => {
      setPwaInfo(prev => ({
        ...prev,
        isOnline: false
      }))
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('sw.updated', handleSWUpdate)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('sw.updated', handleSWUpdate)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return pwaInfo
}

// Hook for PWA installation
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setCanInstall(true)
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    if (!installPrompt) return false

    try {
      await (installPrompt as any).prompt()
      const { outcome } = await (installPrompt as any).userChoice
      
      if (outcome === 'accepted') {
        setCanInstall(false)
        setInstallPrompt(null)
        return true
      }
    } catch (error) {
      console.error('PWA installation failed:', error)
    }

    return false
  }

  return {
    canInstall,
    install
  }
}

// Hook for service worker updates
export const useSWUpdate = () => {
  const [swUpdate, setSwUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdate(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const applyUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    swUpdate,
    applyUpdate
  }
}

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
      setConnectionType(connection.effectiveType || 'unknown')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return {
    isOnline,
    connectionType
  }
}
