// AI Dashboard Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Brain, 
  Zap,
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

interface PredictionCard {
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  factors: string[];
}

interface AnomalyAlert {
  id: string;
  type: 'salary' | 'overtime' | 'leave';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestions: string[];
  date: string;
}

interface WorkloadInsight {
  userId: string;
  currentWorkload: number;
  optimalWorkload: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const AIDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<PredictionCard[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [workloadInsights, setWorkloadInsights] = useState<WorkloadInsight[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [efficiency, setEfficiency] = useState(0);

  useEffect(() => {
    if (user) {
      loadAIData();
    }
  }, [user]);

  const loadAIData = async () => {
    try {
      setLoading(true);
      logger.info('Loading AI dashboard data', { userId: user?.id }, 'AIDashboard');

      // Mock data - gerçek implementasyonda API çağrıları yapılacak
      const mockPredictions: PredictionCard[] = [
        {
          title: 'Maaş Trendi',
          value: 28500,
          unit: 'TL',
          trend: 'up',
          confidence: 0.85,
          factors: ['performans artışı', 'enflasyon', 'promosyon']
        },
        {
          title: 'Mesai Tahmini',
          value: 45,
          unit: 'saat',
          trend: 'stable',
          confidence: 0.72,
          factors: ['mevcut iş yükü', 'proje yoğunluğu']
        },
        {
          title: 'Verimlilik',
          value: 87,
          unit: '%',
          trend: 'up',
          confidence: 0.91,
          factors: ['ekip uyumu', 'teknolojik iyileştirmeler']
        }
      ];

      const mockAnomalies: AnomalyAlert[] = [
        {
          id: '1',
          type: 'overtime',
          severity: 'medium',
          description: 'Bu ayki mesai saati beklenenden %50 daha yüksek',
          suggestions: [
            'İş dağılımını gözden geçirin',
            'Ek personel ataması düşünün',
            'Proje timeline'ını optimize edin'
          ],
          date: '2024-01-15'
        }
      ];

      const mockWorkloadInsights: WorkloadInsight[] = [
        {
          userId: user?.id || '',
          currentWorkload: 135,
          optimalWorkload: 120,
          burnoutRisk: 'medium',
          recommendations: [
            'Haftalık 1 gün uzaktan çalışma',
            'Stres yönetimi atölyesi',
            'Görev önceliklendirme'
          ]
        }
      ];

      const mockNotifications = [
        {
          type: 'warning',
          title: 'Mesai Limiti Yaklaşıyor',
          message: 'Bu ay 185 saat mesai yaptınız. Limit olan 200 saate yaklaşıyorsunuz.',
          action: { label: 'Çizelge Göster', action: 'show-schedule' }
        },
        {
          type: 'info',
          title: 'Performans Artışı',
          message: 'Son 3 ayda verimliliğiniz %15 arttı. Tebrikler!'
        }
      ];

      setPredictions(mockPredictions);
      setAnomalies(mockAnomalies);
      setWorkloadInsights(mockWorkloadInsights);
      setNotifications(mockNotifications);
      setEfficiency(87);

      logger.info('AI dashboard data loaded successfully', null, 'AIDashboard');
    } catch (error) {
      logger.error('Failed to load AI dashboard data', error, 'AIDashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className=\"h-4 w-4 text-green-500\" />;
      case 'down':
        return <TrendingDown className=\"h-4 w-4 text-red-500\" />;
      default:
        return <div className=\"h-4 w-4 bg-gray-300 rounded-full\" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getWorkloadColor = (current: number, optimal: number) => {
    const ratio = current / optimal;
    if (ratio > 1.2) return 'text-red-600';
    if (ratio > 1.0) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
        <span className=\"ml-2 text-gray-600\">AI verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className=\"space-y-6 p-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center space-x-2\">
          <Brain className=\"h-6 w-6 text-blue-600\" />
          <h1 className=\"text-2xl font-bold\">AI & Otomasyon Dashboard</h1>
        </div>
        <Button onClick={loadAIData} variant=\"outline\" size=\"sm\">
          <Zap className=\"h-4 w-4 mr-2\" />
          Verileri Yenile
        </Button>
      </div>

      {/* AI Insights Summary */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Toplam Verimlilik</p>
                <p className=\"text-2xl font-bold\">{efficiency}%</p>
              </div>
              <TrendingUp className=\"h-8 w-8 text-green-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Anomali Tespiti</p>
                <p className=\"text-2xl font-bold\">{anomalies.length}</p>
              </div>
              <AlertTriangle className=\"h-8 w-8 text-orange-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Tahmin Doğruluğu</p>
                <p className=\"text-2xl font-bold\">82%</p>
              </div>
              <Brain className=\"h-8 w-8 text-blue-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Otomasyon Tasarrufu</p>
                <p className=\"text-2xl font-bold\">45h/ay</p>
              </div>
              <Clock className=\"h-8 w-8 text-purple-500\" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions */}
      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
        {predictions.map((prediction, index) => (
          <Card key={index}>
            <CardHeader className=\"pb-2\">
              <div className=\"flex items-center justify-between\">
                <CardTitle className=\"text-lg\">{prediction.title}</CardTitle>
                {getTrendIcon(prediction.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                <div className=\"flex items-baseline space-x-2\">
                  <span className=\"text-3xl font-bold\">{prediction.value}</span>
                  <span className=\"text-gray-600\">{prediction.unit}</span>
                </div>
                
                <div className=\"space-y-1\">
                  <div className=\"flex justify-between text-sm\">
                    <span>Güven Seviyesi</span>
                    <span>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <Progress value={prediction.confidence * 100} className=\"h-2\" />
                </div>

                <div className=\"space-y-1\">
                  <p className=\"text-sm font-medium\">Etkileyen Faktörler:</p>
                  <div className=\"flex flex-wrap gap-1\">
                    {prediction.factors.map((factor, idx) => (
                      <Badge key={idx} variant=\"secondary\" className=\"text-xs\">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomalies and Alerts */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <AlertTriangle className=\"h-5 w-5\" />
              <span>Anomali Tespitleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            {anomalies.length === 0 ? (
              <p className=\"text-gray-500 text-center py-4\">Anomali tespit edilmedi</p>
            ) : (
              anomalies.map((anomaly) => (
                <Alert key={anomaly.id} className=\"border-l-4 border-l-orange-500\">
                  <div className=\"flex items-start justify-between\">
                    <div className=\"flex-1\">
                      <div className=\"flex items-center space-x-2 mb-2\">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <span className=\"text-sm text-gray-600\">{anomaly.date}</span>
                      </div>
                      <AlertDescription className=\"mb-2\">
                        {anomaly.description}
                      </AlertDescription>
                      <div className=\"space-y-1\">
                        <p className=\"text-sm font-medium\">Öneriler:</p>
                        <ul className=\"text-sm space-y-1 ml-4\">
                          {anomaly.suggestions.map((suggestion, idx) => (
                            <li key={idx} className=\"flex items-start space-x-2\">
                              <span className=\"text-orange-500\">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>

        {/* Workload Insights */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Users className=\"h-5 w-5\" />
              <span>İş Yükü Analizi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            {workloadInsights.map((insight) => (
              <div key={insight.userId} className=\"space-y-3\">
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-sm font-medium\">Mevcut İş Yükü</span>
                  <span className={`font-bold ${getWorkloadColor(insight.currentWorkload, insight.optimalWorkload)}`}>
                    {insight.currentWorkload}%
                  </span>
                </div>
                
                <div className=\"space-y-1\">
                  <div className=\"flex justify-between text-sm\">
                    <span>Optimal İş Yükü</span>
                    <span>{insight.optimalWorkload}%</span>
                  </div>
                  <Progress 
                    value={(insight.currentWorkload / insight.optimalWorkload) * 100} 
                    className=\"h-2\"
                  />
                </div>

                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm\">Burnout Riski</span>
                  <Badge className={
                    insight.burnoutRisk === 'high' ? 'bg-red-100 text-red-800' :
                    insight.burnoutRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {insight.burnoutRisk.toUpperCase()}
                  </Badge>
                </div>

                <div className=\"space-y-1\">
                  <p className=\"text-sm font-medium\">Öneriler:</p>
                  <ul className=\"text-sm space-y-1 ml-4\">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx} className=\"flex items-start space-x-2\">
                        <span className=\"text-blue-500\">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Smart Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <Zap className=\"h-5 w-5\" />
            <span>Akıllı Bildirimler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-3\">
          {notifications.map((notification, index) => (
            <Alert key={index} className={
              notification.type === 'warning' ? 'border-l-4 border-l-orange-500' :
              notification.type === 'critical' ? 'border-l-4 border-l-red-500' :
              'border-l-4 border-l-blue-500'
            }>
              <div className=\"flex items-start justify-between\">
                <div className=\"flex-1\">
                  <div className=\"font-medium mb-1\">{notification.title}</div>
                  <AlertDescription>{notification.message}</AlertDescription>
                </div>
                {notification.action && (
                  <Button variant=\"outline\" size=\"sm\" className=\"ml-4\">
                    {notification.action.label}
                  </Button>
                )}
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
