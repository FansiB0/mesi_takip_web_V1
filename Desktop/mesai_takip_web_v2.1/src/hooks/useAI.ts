// AI Hook for React Components

import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';

export interface UseAIPrediction {
  predict: () => Promise<void>;
  data: any;
  loading: boolean;
  error: string | null;
}

export interface UseAIAnomalyDetection {
  detectAnomalies: (data: any[]) => Promise<void>;
  anomalies: any[];
  loading: boolean;
  error: string | null;
}

export interface UseAIWorkloadAnalysis {
  analyzeWorkload: (timeRange: { start: string; end: string }) => Promise<void>;
  workloadData: any;
  loading: boolean;
  error: string | null;
}

// Maaş trend tahmini hook'u
export const useSalaryPrediction = (userId: string): UseAIPrediction => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - gerçek implementasyonda API çağrısı yapılacak
      const mockHistoricalData = [
        { id: '1', userId, baseSalary: 25000, overtimePay: 2000, bonus: 1000, paymentDate: '2024-01-01' },
        { id: '2', userId, baseSalary: 25000, overtimePay: 1800, bonus: 1200, paymentDate: '2024-02-01' },
        { id: '3', userId, baseSalary: 26000, overtimePay: 2200, bonus: 1500, paymentDate: '2024-03-01' },
      ];

      const result = await aiService.predictSalaryTrends(userId, mockHistoricalData);
      setData(result);
      
      logger.info('Salary prediction completed', { userId, result }, 'useSalaryPrediction');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tahminleme başarısız';
      setError(errorMessage);
      logger.error('Salary prediction failed', err, 'useSalaryPrediction');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { predict, data, loading, error };
};

// Mesai tahmini hook'u
export const useOvertimePrediction = (userId: string): UseAIPrediction => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockCurrentData = [
        { id: '1', userId, date: '2024-01-15', hours: 8, reason: 'Proje teslimi' },
        { id: '2', userId, date: '2024-01-20', hours: 6, reason: 'Müşteri toplantısı' },
      ];

      const mockHistoricalData = [
        { id: '1', userId, date: '2023-12-15', hours: 10, reason: 'Yıl sonu kapanışı' },
        { id: '2', userId, date: '2023-11-15', hours: 12, reason: 'Proje teslimi' },
      ];

      const result = await aiService.predictOvertimeNeeds(userId, mockCurrentData, mockHistoricalData);
      setData(result);
      
      logger.info('Overtime prediction completed', { userId, result }, 'useOvertimePrediction');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mesai tahmini başarısız';
      setError(errorMessage);
      logger.error('Overtime prediction failed', err, 'useOvertimePrediction');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { predict, data, loading, error };
};

// Anomali tespiti hook'u
export const useAnomalyDetection = (): UseAIAnomalyDetection => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectAnomalies = useCallback(async (data: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await aiService.detectAnomalies('salary', data);
      setAnomalies(results);
      
      logger.info('Anomaly detection completed', { dataCount: data.length, anomaliesFound: results.length }, 'useAnomalyDetection');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Anomali tespiti başarısız';
      setError(errorMessage);
      logger.error('Anomaly detection failed', err, 'useAnomalyDetection');
    } finally {
      setLoading(false);
    }
  }, []);

  return { detectAnomalies, anomalies, loading, error };
};

// İş yükü analizi hook'u
export const useWorkloadAnalysis = (userId: string): UseAIWorkloadAnalysis => {
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWorkload = useCallback(async (timeRange: { start: string; end: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockOvertimeData = [
        { id: '1', userId, date: '2024-01-15', hours: 8, reason: 'Proje teslimi' },
        { id: '2', userId, date: '2024-01-20', hours: 6, reason: 'Müşteri toplantısı' },
      ];

      const mockLeaveData = [
        { id: '1', userId, startDate: '2024-01-10', endDate: '2024-01-12', status: 'approved', type: 'annual' },
      ];

      const result = await aiService.analyzeWorkload(userId, mockOvertimeData, mockLeaveData, timeRange);
      setWorkloadData(result);
      
      logger.info('Workload analysis completed', { userId, timeRange, result }, 'useWorkloadAnalysis');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'İş yükü analizi başarısız';
      setError(errorMessage);
      logger.error('Workload analysis failed', err, 'useWorkloadAnalysis');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { analyzeWorkload, workloadData, loading, error };
};

// Akıllı bildirimler hook'u
export const useSmartNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const results = await aiService.generateSmartNotifications(userId);
      setNotifications(results);
      
      logger.info('Smart notifications generated', { userId, count: results.length }, 'useSmartNotifications');
    } catch (err) {
      logger.error('Smart notification generation failed', err, 'useSmartNotifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      generateNotifications();
    }
  }, [userId, generateNotifications]);

  return { notifications, loading, refresh: generateNotifications };
};

// Çizelge optimizasyonu hook'u
export const useScheduleOptimization = () => {
  const [optimizedSchedule, setOptimizedSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeSchedule = useCallback(async (
    teamData: any[],
    projectRequirements: any[],
    timeRange: { start: string; end: string }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await aiService.optimizeSchedule(teamData, projectRequirements, timeRange);
      setOptimizedSchedule(result);
      
      logger.info('Schedule optimization completed', { 
        teamSize: teamData.length, 
        projectCount: projectRequirements.length,
        efficiency: result.totalEfficiency 
      }, 'useScheduleOptimization');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Çizelge optimizasyonu başarısız';
      setError(errorMessage);
      logger.error('Schedule optimization failed', err, 'useScheduleOptimization');
    } finally {
      setLoading(false);
    }
  }, []);

  return { optimizeSchedule, optimizedSchedule, loading, error };
};

// AI önerileri hook'u
export const useAIRecommendations = (userId: string) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock recommendations - gerçek implementasyonda AI servisi çağrılacak
      const mockRecommendations = [
        {
          type: 'workload',
          title: 'İş yükü dengelensin',
          description: 'Mevcut iş yükünüz optimalin %15 üzerinde. Görevleri yeniden önceliklendirin.',
          priority: 'high',
          actions: ['Görevleri yeniden düzenle', 'Ek destek talep et']
        },
        {
          type: 'training',
          title: 'Eğitim önerisi',
          description: 'Proje yönetimi becerilerinizi geliştirmek için eğitim öneriyoruz.',
          priority: 'medium',
          actions: ['Eğitim programına katıl', 'Mentorluk talep et']
        },
        {
          type: 'wellness',
          title: 'Sağlık önerisi',
          description: 'Son 3 ayda yüksek mesai yaptınız. Dinlenme sürenizi artırın.',
          priority: 'medium',
          actions: ['İzin planla', 'Ergonomik düzenleme']
        }
      ];

      setRecommendations(mockRecommendations);
      
      logger.info('AI recommendations generated', { userId, count: mockRecommendations.length }, 'useAIRecommendations');
    } catch (err) {
      logger.error('AI recommendation generation failed', err, 'useAIRecommendations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      generateRecommendations();
    }
  }, [userId, generateRecommendations]);

  return { recommendations, loading, refresh: generateRecommendations };
};

// Performans tahmini hook'u
export const usePerformancePrediction = (userId: string) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock performance data
      const mockPerformanceData = {
        currentScore: 87,
        predictedScore: 91,
        confidence: 0.82,
        factors: [
          { name: 'Proje tamamlama oranı', impact: 0.3, value: 92 },
          { name: 'Ekip uyumu', impact: 0.25, value: 88 },
          { name: 'İnovasyon katkısı', impact: 0.2, value: 85 },
          { name: 'Müşteri memnuniyeti', impact: 0.25, value: 90 }
        ],
        recommendations: [
          'İnovasyon projelerine daha fazla katılım gösterin',
          'Ekip liderliği becerilerinizi geliştirin',
          'Müşteri geri bildirimlerini daha aktif takip edin'
        ]
      };

      setPerformanceData(mockPerformanceData);
      
      logger.info('Performance prediction completed', { userId, result: mockPerformanceData }, 'usePerformancePrediction');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Performans tahmini başarısız';
      setError(errorMessage);
      logger.error('Performance prediction failed', err, 'usePerformancePrediction');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { predictPerformance, performanceData, loading, error };
};

// Kapsamlı AI hook'u
export const useAI = (userId: string) => {
  const salaryPrediction = useSalaryPrediction(userId);
  const overtimePrediction = useOvertimePrediction(userId);
  const anomalyDetection = useAnomalyDetection();
  const workloadAnalysis = useWorkloadAnalysis(userId);
  const smartNotifications = useSmartNotifications(userId);
  const scheduleOptimization = useScheduleOptimization();
  const aiRecommendations = useAIRecommendations(userId);
  const performancePrediction = usePerformancePrediction(userId);

  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([
        salaryPrediction.predict(),
        overtimePrediction.predict(),
        smartNotifications.refresh(),
        aiRecommendations.refresh(),
        performancePrediction.predictPerformance()
      ]);
      
      logger.info('All AI data refreshed successfully', { userId }, 'useAI');
    } catch (err) {
      logger.error('Failed to refresh AI data', err, 'useAI');
    }
  }, [userId, salaryPrediction.predict, overtimePrediction.predict, smartNotifications.refresh, aiRecommendations.refresh, performancePrediction.predictPerformance]);

  return {
    // Individual hooks
    salaryPrediction,
    overtimePrediction,
    anomalyDetection,
    workloadAnalysis,
    smartNotifications,
    scheduleOptimization,
    aiRecommendations,
    performancePrediction,
    
    // Combined actions
    refreshAllData,
    
    // Loading states
    isLoading: salaryPrediction.loading || overtimePrediction.loading || 
              workloadAnalysis.loading || smartNotifications.loading || 
              aiRecommendations.loading || performancePrediction.loading,
    
    // Error states
    hasErrors: !!(salaryPrediction.error || overtimePrediction.error || 
                workloadAnalysis.error || performancePrediction.error)
  };
};
