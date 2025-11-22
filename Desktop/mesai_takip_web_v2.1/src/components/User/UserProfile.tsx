import React, { useState } from 'react';
import { User, Settings, LogOut, Edit2, Camera, Mail, Phone, Calendar, Briefcase, Award, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

interface UserProfileProps {
  onEditProfile?: () => void;
  onSettings?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onEditProfile, onSettings }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mock user data - gerçek uygulamada bu props ile gelecek
  const userData = {
    name: user?.name || 'Ahmet Yılmaz',
    email: user?.email || 'ahmet.yilmaz@example.com',
    phone: '+90 532 123 45 67',
    department: 'Yazılım Geliştirme',
    position: 'Senior Developer',
    startDate: '01.03.2020',
    avatar: null,
    stats: {
      completedTasks: 127,
      overtimeHours: 45,
      leaveDaysRemaining: 12,
      performanceScore: 92
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const MobileProfileView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">
                {getInitials(userData.name)}
              </span>
            </div>
          )}
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
            <Camera className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{userData.name}</h3>
          <p className="text-sm text-gray-600">{userData.position}</p>
          <button
            onClick={onEditProfile}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
          >
            <Edit2 className="w-4 h-4" />
            <span>Profili Düzenle</span>
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3 text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="text-sm">{userData.email}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <Phone className="w-4 h-4" />
          <span className="text-sm">{userData.phone}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">{userData.department}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">İşe Başlama: {userData.startDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{userData.stats.completedTasks}</div>
          <div className="text-xs text-gray-600">Tamamlanan Görev</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{userData.stats.overtimeHours}h</div>
          <div className="text-xs text-gray-600">Mesai Saati</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{userData.stats.leaveDaysRemaining}</div>
          <div className="text-xs text-gray-600">Kalan İzin</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{userData.stats.performanceScore}%</div>
          <div className="text-xs text-gray-600">Performans</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onSettings}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Ayarlar</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  const DesktopProfileView = () => (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Profil menüsü"
      >
        {userData.avatar ? (
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {getInitials(userData.name)}
            </span>
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{userData.name}</p>
          <p className="text-xs text-gray-600">{userData.position}</p>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {getInitials(userData.name)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{userData.name}</p>
                <p className="text-sm text-gray-600">{userData.email}</p>
                <p className="text-xs text-gray-500">{userData.position}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{userData.stats.completedTasks}</div>
                <div className="text-xs text-gray-500">Görev</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{userData.stats.overtimeHours}h</div>
                <div className="text-xs text-gray-500">Mesai</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{userData.stats.leaveDaysRemaining}</div>
                <div className="text-xs text-gray-500">İzin</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{userData.stats.performanceScore}%</div>
                <div className="text-xs text-gray-500">Performans</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onEditProfile?.();
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Profili Düzenle</span>
            </button>
            <button
              onClick={() => {
                onSettings?.();
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Ayarlar</span>
            </button>
            <div className="border-t border-gray-100 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? <MobileProfileView /> : <DesktopProfileView />}
    </>
  );
};

export default UserProfile;
