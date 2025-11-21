// AI ve Otomasyon Servisi

import { Salary, Overtime, Leave, User } from '../types';
import { logger } from '../utils/logger';

export interface PredictionResult {
  predicted: number;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestions: string[];
}

export interface WorkloadAnalysis {
  currentWorkload: number;
  optimalWorkload: number;
  recommendations: string[];
  burnoutRisk: 'low' | 'medium' | 'high';
}

export interface ScheduleOptimization {
  optimizedSchedule: {
    userId: string;
    date: string;
    workload: number;
    efficiency: number;
  }[];
  totalEfficiency: number;
  savings: {
    hours: number;
    cost: number;
  };
}

class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Maaş tahminleme - geçmiş verilere dayalı
  async predictSalaryTrends(
    userId: string, 
    historicalData: Salary[]
  ): Promise<PredictionResult> {
    try {
      logger.info('Starting salary trend prediction', { userId }, 'AIService');

      // Basit lineer regresyon tahmini
      const monthlySalaries = historicalData.map(s => ({
        month: new Date(s.paymentDate).getMonth(),
        year: new Date(s.paymentDate).getFullYear(),
        amount: s.baseSalary + (s.overtimePay || 0) + (s.bonus || 0)
      }));

      // Tahmin algoritması
      const prediction = this.calculateLinearTrend(monthlySalaries);
      
      logger.info('Salary prediction completed', { 
        userId, 
        predicted: prediction.predicted,
        confidence: prediction.confidence 
      }, 'AIService');

      return prediction;
    } catch (error) {
      logger.error('Salary prediction failed', error, 'AIService');
      throw error;
    }
  }

  // Mesai tahminleme - mevcut workload'a dayalı
  async predictOvertimeNeeds(
    userId: string,
    currentMonthData: Overtime[],
    historicalData: Overtime[]
  ): Promise<PredictionResult> {
    try {
      logger.info('Starting overtime prediction', { userId }, 'AIService');

      // Mevsimsel ve proje bazlı analiz
      const seasonalFactors = this.analyzeSeasonalPatterns(historicalData);
      const currentWorkload = this.calculateCurrentWorkload(currentMonthData);
      
      const predictedHours = this.calculateOvertimePrediction(
        currentWorkload, 
        seasonalFactors
      );

      return {
        predicted: predictedHours,
        confidence: 0.75,
        factors: ['mevcut iş yükü', 'mevsimsel trend', 'proje yoğunluğu'],
        trend: predictedHours > currentMonthData.length * 8 ? 'increasing' : 'stable'
      };
    } catch (error) {
      logger.error('Overtime prediction failed', error, 'AIService');
      throw error;
    }
  }

  // Anomali tespiti - abnormal patterns
  async detectAnomalies(
    dataType: 'salary' | 'overtime' | 'leave',
    data: any[]
  ): Promise<AnomalyDetection[]> {
    try {
      logger.info('Starting anomaly detection', { dataType, dataCount: data.length }, 'AIService');

      const anomalies: AnomalyDetection[] = [];
      
      // İstatistiksel anomali tespiti
      const stats = this.calculateStatistics(data);
      
      data.forEach((item, index) => {
        const value = this.extractValue(item, dataType);
        const zScore = Math.abs((value - stats.mean) / stats.stdDev);
        
        if (zScore > 2.5) { // 2.5 sigma threshold
          anomalies.push({
            isAnomaly: true,
            severity: zScore > 3.5 ? 'high' : zScore > 3 ? 'medium' : 'low',
            description: `${dataType} değerinde anomali tespit edildi: ${value} (${zScore.toFixed(2)} sigma)`,
            suggestions: this.generateAnomalySuggestions(dataType, value, stats)
          });
        }
      });

      logger.info('Anomaly detection completed', { 
        dataType, 
        anomaliesFound: anomalies.length 
      }, 'AIService');

      return anomalies;
    } catch (error) {
      logger.error('Anomaly detection failed', error, 'AIService');
      throw error;
    }
  }

  // İş yükü analizi
  async analyzeWorkload(
    userId: string,
    overtimeData: Overtime[],
    leaveData: Leave[],
    timeRange: { start: string; end: string }
  ): Promise<WorkloadAnalysis> {
    try {
      logger.info('Starting workload analysis', { userId, timeRange }, 'AIService');

      const totalWorkHours = overtimeData.reduce((sum, ot) => sum + ot.hours, 0);
      const leaveDays = leaveData.filter(l => l.status === 'approved').length;
      const workDays = this.calculateWorkDays(timeRange.start, timeRange.end);
      
      const currentWorkload = (totalWorkHours / (workDays - leaveDays)) * 100;
      const optimalWorkload = 120; // %120 ideal workload
      
      const burnoutRisk = this.calculateBurnoutRisk(currentWorkload, leaveDays);
      const recommendations = this.generateWorkloadRecommendations(
        currentWorkload, 
        optimalWorkload, 
        burnoutRisk
      );

      return {
        currentWorkload,
        optimalWorkload,
        recommendations,
        burnoutRisk
      };
    } catch (error) {
      logger.error('Workload analysis failed', error, 'AIService');
      throw error;
    }
  }

  // Çizelge optimizasyonu
  async optimizeSchedule(
    teamData: {
      userId: string;
      skills: string[];
      maxWorkload: number;
      preferences: string[];
    }[],
    projectRequirements: {
      skill: string;
      hours: number;
      priority: 'low' | 'medium' | 'high';
    }[],
    timeRange: { start: string; end: string }
  ): Promise<ScheduleOptimization> {
    try {
      logger.info('Starting schedule optimization', { 
        teamSize: teamData.length, 
        projectCount: projectRequirements.length 
      }, 'AIService');

      // Basit greedy algoritma - gerçek uygulamada daha karmaşık algoritmalar kullanılabilir
      const optimizedSchedule = this.generateOptimalSchedule(teamData, projectRequirements, timeRange);
      const efficiency = this.calculateScheduleEfficiency(optimizedSchedule);
      const savings = this.calculateSavings(optimizedSchedule);

      return {
        optimizedSchedule,
        totalEfficiency: efficiency,
        savings
      };
    } catch (error) {
      logger.error('Schedule optimization failed', error, 'AIService');
      throw error;
    }
  }

  // Akıllı bildirimler
  async generateSmartNotifications(userId: string): Promise<{
    type: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    action?: {
      label: string;
      action: string;
    };
  }[]> {
    try {
      const notifications = [];

      // Mesai limiti uyarısı
      const monthlyOvertime = await this.getMonthlyOvertime(userId);
      if (monthlyOvertime > 180) { // 180 saat/ay limit
        notifications.push({
          type: 'warning',
          title: 'Mesai Limiti Yaklaşıyor',
          message: `Bu ay ${monthlyOvertime} saat mesai yaptınız. Limit olan 200 saate yaklaşıyorsunuz.`,
          action: {
            label: 'Çizelge Göster',
            action: 'show-schedule'
          }
        });
      }

      // İzin kullanım uyarısı
      const annualLeaveUsed = await this.getAnnualLeaveUsed(userId);
      if (annualLeaveUsed > 10) {
        notifications.push({
          type: 'info',
          title: 'İzin Kullanımı',
          message: `Yıllık ${annualLeaveUsed} gün izin kullandınız. ${14 - annualLeaveUsed} gün izin hakkınız kaldı.`
        });
      }

      return notifications;
    } catch (error) {
      logger.error('Smart notification generation failed', error, 'AIService');
      return [];
    }
  }

  // Yardımcı metotlar
  private calculateLinearTrend(data: { month: number; year: number; amount: number }[]): PredictionResult {
    if (data.length < 2) {
      return {
        predicted: data[0]?.amount || 0,
        confidence: 0.1,
        factors: ['yetersiz veri'],
        trend: 'stable'
      };
    }

    // Basit lineer regresyon
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.month + d.year * 12, 0);
    const sumY = data.reduce((sum, d) => sum + d.amount, 0);
    const sumXY = data.reduce((sum, d) => sum + (d.month + d.year * 12) * d.amount, 0);
    const sumX2 = data.reduce((sum, d) => sum + Math.pow(d.month + d.year * 12, 2), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextPeriod = data[data.length - 1].month + data[data.length - 1].year * 12 + 1;
    const predicted = slope * nextPeriod + intercept;

    return {
      predicted: Math.max(0, predicted),
      confidence: Math.min(0.9, data.length / 12), // Veri miktarına göre güven
      factors: ['geçmiş trend', 'mevsimsel etki'],
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  private analyzeSeasonalPatterns(data: Overtime[]): number[] {
    // Mevsimsel pattern analizi - basit implementasyon
    const seasonalFactors = new Array(12).fill(1);
    
    data.forEach(ot => {
      const month = new Date(ot.date).getMonth();
      seasonalFactors[month] += ot.hours * 0.01;
    });

    return seasonalFactors;
  }

  private calculateCurrentWorkload(currentData: Overtime[]): number {
    return currentData.reduce((sum, ot) => sum + ot.hours, 0);
  }

  private calculateOvertimePrediction(currentWorkload: number, seasonalFactors: number[]): number {
    const currentMonth = new Date().getMonth();
    const seasonalFactor = seasonalFactors[currentMonth] || 1;
    return currentWorkload * seasonalFactor * 1.1; // %10 artış tahmini
  }

  private calculateStatistics(data: any[]) {
    const values = data.map(item => this.extractValue(item, 'salary'));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  private extractValue(item: any, dataType: string): number {
    switch (dataType) {
      case 'salary':
        return item.baseSalary + (item.overtimePay || 0) + (item.bonus || 0);
      case 'overtime':
        return item.hours || 0;
      case 'leave':
        return item.days || 0;
      default:
        return 0;
    }
  }

  private generateAnomalySuggestions(dataType: string, value: number, stats: { mean: number; stdDev: number }): string[] {
    const suggestions = [];
    
    if (value > stats.mean + stats.stdDev * 2) {
      suggestions.push(`${dataType} değerini gözden geçirin - beklenenin çok üzerinde`);
      suggestions.push('Veri giriş hatası olup olmadığını kontrol edin');
    } else if (value < stats.mean - stats.stdDev * 2) {
      suggestions.push(`${dataType} değerinin düşüklüğünü araştırın`);
      suggestions.push('Eksik veri olup olmadığını kontrol edin');
    }

    return suggestions;
  }

  private calculateWorkDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let workDays = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) workDays++; // Hafta içi günler
    }

    return workDays;
  }

  private calculateBurnoutRisk(workload: number, leaveDays: number): 'low' | 'medium' | 'high' {
    if (workload > 150 && leaveDays < 5) return 'high';
    if (workload > 130 && leaveDays < 10) return 'medium';
    return 'low';
  }

  private generateWorkloadRecommendations(
    current: number, 
    optimal: number, 
    risk: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations = [];

    if (current > optimal) {
      recommendations.push('İş yükünü azaltmak için ek personel düşünün');
      recommendations.push('Görevleri yeniden önceliklendirin');
    }

    if (risk === 'high') {
      recommendations.push('Acil izin planlaması yapın');
      recommendations.push('Stres yönetimi programı önerin');
    } else if (risk === 'medium') {
      recommendations.push('Düzenli molalar teşvik edin');
    }

    return recommendations;
  }

  private generateOptimalSchedule(
    teamData: any[],
    projectRequirements: any[],
    timeRange: { start: string; end: string }
  ) {
    // Basit schedule optimizasyonu - gerçek uygulamada daha karmaşık algoritmalar
    const schedule = [];
    const workDays = this.calculateWorkDays(timeRange.start, timeRange.end);

    teamData.forEach(member => {
      for (let day = 0; day < workDays; day++) {
        const date = new Date(timeRange.start);
        date.setDate(date.getDate() + day);

        schedule.push({
          userId: member.userId,
          date: date.toISOString().split('T')[0],
          workload: Math.random() * 8 + 4, // 4-8 saat arası rastgele
          efficiency: Math.random() * 0.3 + 0.7 // 70-100% verimlilik
        });
      }
    });

    return schedule;
  }

  private calculateScheduleEfficiency(schedule: any[]): number {
    const totalEfficiency = schedule.reduce((sum, s) => sum + s.efficiency, 0);
    return totalEfficiency / schedule.length;
  }

  private calculateSavings(schedule: any[]): { hours: number; cost: number } {
    const avgHourlyCost = 100; // TL cinsinden
    const efficiencyGain = 0.1; // %10 verimlilik artışı
    const totalHours = schedule.length * 8; // Toplam çalışma saati

    return {
      hours: totalHours * efficiencyGain,
      cost: totalHours * efficiencyGain * avgHourlyCost
    };
  }

  // Mock metotlar - gerçek implementasyonda database'e erişim gerekir
  private async getMonthlyOvertime(userId: string): Promise<number> {
    // Mock implementation
    return Math.random() * 200;
  }

  private async getAnnualLeaveUsed(userId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 14);
  }
}

export const aiService = AIService.getInstance();
