// AI Widget - Dashboard AI Insights Widget

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  ChevronRight,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

// Mock UI Components
const MockCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>{children}</div>
);

const MockCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const MockCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b flex items-center justify-between ${className}`}>{children}</div>
);

const MockCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold ${className}`}>{children}</h3>
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
  <div className={`w-full bg-gray-200 rounded-full h-1.5 ${className}`}>
    <div 
      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
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

interface AIWidgetProps {
  compact?: boolean;
}

export const AIWidget: React.FC<AIWidgetProps> = ({ compact = false }) => {
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
      icon: <TrendingUp className="h-4 w-4 text-green-500" />
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Mesai Tahmini',
      value: '48 saat',
      trend: 'up',
      confidence: 72,
      icon: <Clock className="h-4 w-4 text-orange-500" />
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Anomali',
      value: '2 tespit',
      trend: 'stable',
      confidence: 90,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Verimlilik',
      value: '89%',
      trend: 'up',
      confidence: 78,
      icon: <Target className="h-4 w-4 text-blue-500" />
    }
  ]);

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      logger.info('Loading AI widget insights', { userId: user?.id }, 'AIWidget');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data already set in state
      logger.info('AI widget insights loaded', { insightsCount: insights.length }, 'AIWidget');
    } catch (error) {
      logger.error('Failed to load AI insights', error, 'AIWidget');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setLoading(true);
    try {
      logger.info('Refreshing AI insights', { userId: user?.id }, 'AIWidget');
      
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
          icon: <TrendingUp className="h-4 w-4 text-green-500" />
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Mesai Tahmini',
          value: '45 saat',
          trend: 'down',
          confidence: 75,
          icon: <Clock className="h-4 w-4 text-orange-500" />
        },
        {
          id: '3',
          type: 'anomaly',
          title: 'Anomali',
          value: '1 tespit',
          trend: 'down',
          confidence: 92,
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Verimlilik',
          value: '91%',
          trend: 'up',
          confidence: 82,
          icon: <Target className="h-4 w-4 text-blue-500" />
        }
      ]);
      
      logger.info('AI insights refreshed', { insightsCount: insights.length }, 'AIWidget');
    } catch (error) {
      logger.error('Failed to refresh AI insights', error, 'AIWidget');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <MockCard className={compact ? 'h-48' : 'h-64'}>
        <MockCardContent>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">AI analiz ediliyor...</p>
            </div>
          </div>
        </MockCardContent>
      </MockCard>
    );
  }

  return (
    <MockCard className={compact ? 'h-48' : 'h-64'}>
      <MockCardHeader>
        <MockCardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>AI Insights</span>
        </MockCardTitle>
        <div className="flex items-center space-x-2">
          <MockButton variant="ghost" size="sm" onClick={refreshInsights} disabled={loading}>
            <Zap className="h-3 w-3 mr-1" />
            Yenile
          </MockButton>
          {!compact && (
            <MockButton variant="outline" size="sm">
              Detaylar
              <ChevronRight className="h-3 w-3 ml-1" />
            </MockButton>
          )}
        </div>
      </MockCardHeader>
      
      <MockCardContent>
        <div className="space-y-3">
          {insights.slice(0, compact ? 3 : 4).map((insight) => (
            <div key={insight.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {insight.icon}
                <div className={compact ? 'flex-1' : ''}>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold">{insight.value}</p>
                    {getTrendIcon(insight.trend)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                  %{insight.confidence}
                </p>
                <MockProgress value={insight.confidence} className="w-12 mt-1" />
              </div>
            </div>
          ))}
        </div>
        
        {compact && insights.length > 3 && (
          <div className="mt-3 pt-3 border-t">
            <MockButton variant="ghost" size="sm" className="w-full">
              Tümünü Gör ({insights.length})
              <ChevronRight className="h-3 w-3 ml-1" />
            </MockButton>
          </div>
        )}
      </MockCardContent>
    </MockCard>
  );
};
