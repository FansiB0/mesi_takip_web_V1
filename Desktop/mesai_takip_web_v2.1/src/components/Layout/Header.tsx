import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import NotificationCenter from '../Notifications/NotificationCenter';
import UserProfile from '../User/UserProfile';
import { Notification } from '../Notifications/NotificationCenter';

const Header: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Yeni Mesai Kaydı',
      message: 'Bu ay 5 saat fazla mesai kaydınız onaylandı.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '2',
      title: 'Maaş Ödemesi',
      message: 'Aralık ayı maaşınız hesaplandı. Net maaş: ₺28,750',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleEditProfile = () => {
    // Profil düzenleme modal'ı veya yönlendirme
    console.log('Edit profile clicked');
  };

  const handleSettings = () => {
    // Ayarlar sayfasına yönlendirme
    window.location.hash = 'settings';
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Sol Taraf - Logo ve Menu */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            aria-label="Menüyü aç/kapat"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-shrink-0 ml-2 lg:ml-0">
            <h1 className={`text-xl font-bold text-gray-900 dark:text-white transition-all duration-300 ${
              isCollapsed ? 'md:ml-16' : 'md:ml-64'
            }`}>
              Maaş & Çalışma Takibi
            </h1>
          </div>
        </div>

        {/* Sağ Taraf - Bildirimler ve Profil */}
        <div className="flex items-center space-x-4">
          {/* Bildirim Merkezi */}
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDismiss={handleDismiss}
            onClearAll={handleClearAll}
          />
          
          {/* Kullanıcı Profili */}
          <UserProfile
            onEditProfile={handleEditProfile}
            onSettings={handleSettings}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;