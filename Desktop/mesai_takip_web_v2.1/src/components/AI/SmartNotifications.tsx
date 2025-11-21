import React, { useState } from 'react';
import { Bell, Settings, RefreshCw, X, CheckCircle, AlertTriangle, Info, Filter, Search } from 'lucide-react';

// Mock UI Components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className || ''}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'default', disabled = false, size = 'default' }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline'; 
  disabled?: boolean;
  size?: 'sm' | 'default';
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' 
        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
      size === 'sm' ? 'px-3 py-1 text-sm' : ''
    }`}
  >
    {children}
  </button>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive' }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    variant === 'default' ? 'bg-blue-100 text-blue-800' :
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' :
    'bg-red-100 text-red-800'
  }`}>
    {children}
  </span>
);

const Alert = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'destructive' }) => (
  <div className={`p-4 rounded-md ${
    variant === 'destructive' ? 'bg-red-50 border border-red-200 text-red-800' :
    'bg-blue-50 border border-blue-200 text-blue-800'
  }`}>
    {children}
  </div>
);

// Mock data
const mockNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'Yeni AI İçgörüsü',
    description: 'Maaş tahminleri güncellendi',
    timestamp: '2024-01-15T09:00:00Z',
    read: false,
    category: 'ai'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Anomali Tespiti',
    description: '2 yeni anomali tespit edildi',
    timestamp: '2024-01-14T16:30:00Z',
    read: false,
    category: 'anomaly'
  },
  {
    id: 3,
    type: 'info',
    title: 'Performans Raporu',
    description: 'Haftalık performans raporu hazır',
    timestamp: '2024-01-14T10:15:00Z',
    read: true,
    category: 'performance'
  },
  {
    id: 4,
    type: 'error',
    title: 'Sistem Hatası',
    description: 'Veritabanı bağlantısında geçici sorun',
    timestamp: '2024-01-13T14:20:00Z',
    read: true,
    category: 'system'
  },
  {
    id: 5,
    type: 'success',
    title: 'İşlem Başarılı',
    description: 'Maaş verileri başarıyla güncellendi',
    timestamp: '2024-01-13T11:45:00Z',
    read: true,
    category: 'data'
  }
];

export const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const refresh = () => {
    // Mock refresh - would fetch from API in real app
    console.log('Refreshing notifications...');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const executeAction = (notification: any) => {
    console.log('Executing action for:', notification);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai':
        return 'bg-purple-100 text-purple-800';
      case 'anomaly':
        return 'bg-red-100 text-red-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      case 'data':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'ai') return notification.category === 'ai';
    if (filter === 'anomaly') return notification.category === 'anomaly';
    if (filter === 'performance') return notification.category === 'performance';
    if (filter === 'system') return notification.category === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Akıllı Bildirimler</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Tümünü Okundu İşaretle
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtre:</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tümü ({notifications.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Okunmamış ({unreadCount})
            </Button>
            <Button 
              variant={filter === 'ai' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('ai')}
            >
              AI
            </Button>
            <Button 
              variant={filter === 'anomaly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('anomaly')}
            >
              Anomali
            </Button>
            <Button 
              variant={filter === 'performance' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('performance')}
            >
              Performans
            </Button>
            <Button 
              variant={filter === 'system' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('system')}
            >
              Sistem
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bu kategoride bildirim bulunmuyor</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{notification.title}</h3>
                    <Badge className={getCategoryColor(notification.category)}>
                      {notification.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => executeAction(notification)}>
                        İncele
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => dismissNotification(notification.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Ayarları</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">AI Bildirimleri</h3>
                <p className="text-sm text-gray-600">Yeni AI içgörülerinden haberdar olun</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Anomali Bildirimleri</h3>
                <p className="text-sm text-gray-600">Anomali tespitlerinden anında haberdar olun</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Performans Bildirimleri</h3>
                <p className="text-sm text-gray-600">Performans güncellemelerinden haberdar olun</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Sistem Bildirimleri</h3>
                <p className="text-sm text-gray-600">Sistem durumlarından haberdar olun</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              İptal
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Kaydet
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
