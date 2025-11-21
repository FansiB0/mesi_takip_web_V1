import React, { useState } from 'react';
import { Brain, Target, Settings, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

// Mock UI Components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className || ''}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'default', disabled = false, className = '', size = 'default' }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline'; 
  disabled?: boolean;
  className?: string;
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
    } ${className}`}
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

const Progress = ({ value, max = 100 }: { value: number; max?: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
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
const mockInsights = [
  {
    id: 1,
    type: 'salary',
    title: 'Maaş Artışı Tahmini',
    description: 'Ahmet Yılmaz için %15 maaş artışı öngörülüyor',
    confidence: 85,
    trend: 'up'
  },
  {
    id: 2,
    type: 'overtime',
    title: 'Mesai Yüksekliği',
    description: 'Bu ay mesai saatlerinde %25 artış var',
    confidence: 92,
    trend: 'up'
  },
  {
    id: 3,
    type: 'performance',
    title: 'Performans Düşüşü',
    description: 'Mehmet Demir\'in performansında düşüş tespit edildi',
    confidence: 78,
    trend: 'down'
  }
];

const mockAnomalies = [
  {
    id: 1,
    severity: 'high',
    title: 'Anormal Maaş Ödemesi',
    description: 'Ayşe Kaya için beklenmedik yüksek maaş ödemesi',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Mesai Kaydı Eksikliği',
    description: '3 çalışan için mesai kayıtları eksik',
    timestamp: '2024-01-14T14:20:00Z'
  }
];

const mockNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'Yeni AI İçgörüsü',
    description: 'Maaş tahminleri güncellendi',
    timestamp: '2024-01-15T09:00:00Z',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Anomali Tespiti',
    description: '2 yeni anomali tespit edildi',
    timestamp: '2024-01-14T16:30:00Z',
    read: false
  }
];

export const SimpleAIDashboard: React.FC = () => {
  const [insights] = useState(mockInsights);
  const [anomalies] = useState(mockAnomalies);
  const [notifications] = useState(mockNotifications);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI & Otomasyon</h1>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Ayarlar
        </Button>
      </div>

      {/* AI Insights */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI İçgörüleri</h2>
          <Badge variant="secondary">{insights.length} yeni</Badge>
        </div>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getTrendIcon(insight.trend)}
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{insight.confidence}%</div>
                <Progress value={insight.confidence} max={100} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Anomalies */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Anomali Tespitleri</h2>
          <Badge variant="destructive">{anomalies.length} kritik</Badge>
        </div>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <Alert key={anomaly.id} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">{anomaly.title}</h3>
                  <p className="text-sm opacity-90">{anomaly.description}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(anomaly.timestamp).toLocaleString('tr-TR')}
                  </p>
                </div>
                <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                  {anomaly.severity === 'high' ? 'Yüksek' : 'Orta'}
                </Badge>
              </div>
            </Alert>
          ))}
        </div>
      </Card>

      {/* Smart Notifications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Akıllı Bildirimler</h2>
          <Button variant="outline" size="sm">
            Tümünü Okundu İşaretle
          </Button>
        </div>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex-shrink-0">
                {notification.type === 'info' ? (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('tr-TR')}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <Target className="h-4 w-4 mr-2" />
            Yeni Tahmin Oluştur
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="h-4 w-4 mr-2" />
            Personel Analizi
          </Button>
          <Button variant="outline" className="justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Raporlama
          </Button>
        </div>
      </Card>
    </div>
  );
};
