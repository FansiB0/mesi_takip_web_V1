import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, Clock, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

// Mock UI Components
const MockCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>{children}</div>
);

const MockCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const MockCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 border-b ${className}`}>{children}</div>
);

const MockCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const MockButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default';
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '' }) => {
  const baseClasses = 'font-medium transition-colors inline-flex items-center justify-center rounded-md';
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const variantClasses = variant === 'ghost' 
    ? 'hover:bg-gray-100 text-gray-600'
    : variant === 'outline'
    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
    : 'bg-blue-600 text-white hover:bg-blue-700';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const MockProgress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation';
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  icon: React.ReactNode;
}

const SimpleAIDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'prediction',
      title: 'Maaş Tahmini',
      value: '₺26,500',
      trend: 'up',
      confidence: 85,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Mesai Tahmini',
      value: '48 saat',
      trend: 'up',
      confidence: 72,
      icon: <Clock className="h-5 w-5 text-orange-500" />
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Anomali',
      value: '2 tespit',
      trend: 'stable',
      confidence: 90,
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Verimlilik',
      value: '89%',
      trend: 'up',
      confidence: 78,
      icon: <Target className="h-5 w-5 text-blue-500" />
    }
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'anomalies' | 'recommendations'>('overview');

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      logger.info('Loading AI insights', { userId: user?.id }, 'SimpleAIDashboard');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('AI insights loaded', { insightsCount: insights.length }, 'SimpleAIDashboard');
    } catch (error) {
      logger.error('Failed to load AI insights', error, 'SimpleAIDashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setLoading(true);
    try {
      logger.info('Refreshing AI insights', { userId: user?.id }, 'SimpleAIDashboard');
      
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update with new mock data
      setInsights([
        {
          id: '1',
          type: 'prediction',
          title: 'Maaş Tahmini',
          value: '₺27,000',
          trend: 'up',
          confidence: 88,
          icon: <TrendingUp className="h-5 w-5 text-green-500" />
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Mesai Tahmini',
          value: '45 saat',
          trend: 'down',
          confidence: 75,
          icon: <Clock className="h-5 w-5 text-orange-500" />
        },
        {
          id: '3',
          type: 'anomaly',
          title: 'Anomali',
          value: '1 tespit',
          trend: 'down',
          confidence: 92,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Verimlilik',
          value: '91%',
          trend: 'up',
          confidence: 82,
          icon: <Target className="h-5 w-5 text-blue-500" />
        }
      ]);
      
      logger.info('AI insights refreshed', { insightsCount: insights.length }, 'SimpleAIDashboard');
    } catch (error) {
      logger.error('Failed to refresh AI insights', error, 'SimpleAIDashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI & Otomasyon</h1>
            </div>
            <MockButton onClick={refreshInsights} disabled={loading}>
              <Zap className="h-4 w-4 mr-2" />
              Yenile
            </MockButton>
          </div>
          <p className="text-gray-600 mt-2">Yapay zeka destekli analiz ve otomasyon araçları</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: <Brain className="h-4 w-4" /> },
              { id: 'predictions', label: 'Tahminler', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'anomalies', label: 'Anomaliler', icon: <AlertTriangle className="h-4 w-4" /> },
              { id: 'recommendations', label: 'Öneriler', icon: <Target className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {insights.map((insight) => (
            <MockCard key={insight.id}>
              <MockCardContent>
                <div className="flex items-center justify-between mb-4">
                  {insight.icon}
                  <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                    %{insight.confidence}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                  {getTrendIcon(insight.trend)}
                </div>
                <MockProgress value={insight.confidence} className="mt-3" />
              </MockCardContent>
            </MockCard>
          ))}
        </div>

        {/* Detailed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockCard>
            <MockCardHeader>
              <MockCardTitle>Detaylı Analiz</MockCardTitle>
            </MockCardHeader>
            <MockCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maaş Trend</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+%12</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mesai Verimliliği</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-600 font-medium">89%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Risk Skoru</span>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 font-medium">Düşük</span>
                  </div>
                </div>
              </div>
            </MockCardContent>
          </MockCard>

          <MockCard>
            <MockCardHeader>
              <MockCardTitle>AI Önerileri</MockCardTitle>
            </MockCardHeader>
            <MockCardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Verimlilik Artışı</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Bu ay mesai saatlerinizi optimize ederek %15 verimlilik artışı sağlayabilirsiniz.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Maaş Optimizasyonu</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Mevcut performansınıza göre maaşınızda %8 artış potansiyeli görünüyor.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">İzin Planlama</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    İzin günlerinizi daha verimli planlayarak iş akışını iyileştirebilirsiniz.
                  </p>
                </div>
              </div>
            </MockCardContent>
          </MockCard>
        </div>
      </div>
    </div>
  );
};

export default SimpleAIDashboard;
