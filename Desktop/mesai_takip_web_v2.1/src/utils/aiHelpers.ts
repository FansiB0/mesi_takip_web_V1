// AI Helper Functions and Utilities

import { logger } from './logger';
import { PredictionResult, AnomalyDetection, WorkloadAnalysis } from '../types/ai';

// Statistical functions for AI calculations
export class AIHelpers {
  // Calculate linear regression
  static calculateLinearRegression(data: { x: number; y: number }[]) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point) => {
      const yPred = slope * point.x + intercept;
      return sum + Math.pow(point.y - yPred, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);

    return { slope, intercept, r2 };
  }

  // Calculate moving average
  static calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(average);
    }
    return result;
  }

  // Calculate exponential smoothing
  static calculateExponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return [];
    
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(smoothed);
    }
    return result;
  }

  // Calculate Z-score for anomaly detection
  static calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  // Calculate basic statistics
  static calculateStatistics(data: number[]) {
    if (data.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };

    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return { mean, median, stdDev, min, max };
  }

  // Detect outliers using IQR method
  static detectOutliersIQR(data: number[]): { outliers: number[]; indices: number[] } {
    if (data.length < 4) return { outliers: [], indices: [] };

    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers: number[] = [];
    const indices: number[] = [];

    data.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outliers.push(value);
        indices.push(index);
      }
    });

    return { outliers, indices };
  }

  // Calculate correlation coefficient
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Calculate confidence interval
  static calculateConfidenceInterval(data: number[], confidence: number = 0.95): { lower: number; upper: number } {
    const stats = this.calculateStatistics(data);
    const n = data.length;
    const degreesOfFreedom = n - 1;
    
    // Simplified t-value calculation (for normal distribution)
    const tValue = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const marginOfError = tValue * (stats.stdDev / Math.sqrt(n));

    return {
      lower: stats.mean - marginOfError,
      upper: stats.mean + marginOfError
    };
  }

  // Calculate seasonality index
  static calculateSeasonality(data: number[], period: number = 12): number[] {
    if (data.length < period * 2) return new Array(period).fill(1);

    const seasonalIndices: number[] = [];
    const cycles = Math.floor(data.length / period);

    for (let i = 0; i < period; i++) {
      let sum = 0;
      let count = 0;

      for (let cycle = 0; cycle < cycles; cycle++) {
        const index = cycle * period + i;
        if (index < data.length) {
          sum += data[index];
          count++;
        }
      }

      const average = count > 0 ? sum / count : 0;
      const overallAverage = data.reduce((sum, val) => sum + val, 0) / data.length;
      seasonalIndices.push(overallAverage > 0 ? average / overallAverage : 1);
    }

    return seasonalIndices;
  }

  // Calculate trend strength
  static calculateTrendStrength(data: number[]): { strength: number; direction: 'up' | 'down' | 'neutral' } {
    if (data.length < 2) return { strength: 0, direction: 'neutral' };

    const points = data.map((value, index) => ({ x: index, y: value }));
    const regression = this.calculateLinearRegression(points);
    
    const strength = Math.abs(regression.r2);
    const direction = regression.slope > 0.01 ? 'up' : regression.slope < -0.01 ? 'down' : 'neutral';

    return { strength, direction };
  }

  // Calculate workload balance score
  static calculateWorkloadBalance(workloads: number[]): { score: number; imbalance: number } {
    if (workloads.length === 0) return { score: 0, imbalance: 0 };

    const stats = this.calculateStatistics(workloads);
    const coefficientOfVariation = stats.stdDev / stats.mean;
    
    // Balance score: 1 = perfectly balanced, 0 = completely imbalanced
    const score = Math.max(0, 1 - coefficientOfVariation);
    const imbalance = coefficientOfVariation;

    return { score, imbalance };
  }

  // Calculate efficiency score
  static calculateEfficiencyScore(actualOutput: number, expectedOutput: number, timeSpent: number, timeAllocated: number): number {
    if (expectedOutput === 0 || timeAllocated === 0) return 0;

    const outputEfficiency = actualOutput / expectedOutput;
    const timeEfficiency = timeAllocated / timeSpent;
    
    // Weighted average (60% output, 40% time)
    const efficiency = (outputEfficiency * 0.6 + timeEfficiency * 0.4) * 100;
    
    return Math.min(100, Math.max(0, efficiency));
  }

  // Calculate burnout risk score
  static calculateBurnoutRisk(workload: number, hoursWorked: number, leaveDays: number, stressLevel: number): {
    risk: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    // Workload factor (40%)
    if (workload > 120) {
      score += 40;
      factors.push('Yüksek iş yükü');
    } else if (workload > 100) {
      score += 20;
      factors.push('Orta iş yükü');
    }

    // Hours worked factor (30%)
    if (hoursWorked > 50) {
      score += 30;
      factors.push('Fazla çalışma saati');
    } else if (hoursWorked > 45) {
      score += 15;
      factors.push('Yüksek çalışma saati');
    }

    // Leave days factor (20%)
    if (leaveDays < 5) {
      score += 20;
      factors.push('Yetersiz izin');
    } else if (leaveDays < 10) {
      score += 10;
      factors.push('Az izin');
    }

    // Stress level factor (10%)
    if (stressLevel > 8) {
      score += 10;
      factors.push('Yüksek stres seviyesi');
    } else if (stressLevel > 6) {
      score += 5;
      factors.push('Orta stres seviyesi');
    }

    let risk: 'low' | 'medium' | 'high';
    if (score >= 70) {
      risk = 'high';
    } else if (score >= 40) {
      risk = 'medium';
    } else {
      risk = 'low';
    }

    return { risk, score, factors };
  }

  // Calculate skill match score
  static calculateSkillMatch(requiredSkills: string[], availableSkills: string[]): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  } {
    const matchedSkills = requiredSkills.filter(skill => 
      availableSkills.some(available => 
        available.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(available.toLowerCase())
      )
    );

    const missingSkills = requiredSkills.filter(skill => !matchedSkills.includes(skill));
    const score = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 0;

    return { score, matchedSkills, missingSkills };
  }

  // Calculate project complexity score
  static calculateProjectComplexity(
    estimatedHours: number,
    teamSize: number,
    skillRequirements: string[],
    dependencies: number
  ): {
    complexity: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    // Hours factor (25%)
    if (estimatedHours > 200) {
      score += 25;
      factors.push('Yüksek saat tahmini');
    } else if (estimatedHours > 100) {
      score += 15;
      factors.push('Orta saat tahmini');
    }

    // Team size factor (20%)
    if (teamSize > 10) {
      score += 20;
      factors.push('Büyük ekip');
    } else if (teamSize > 5) {
      score += 10;
      factors.push('Orta büyüklükte ekip');
    }

    // Skill requirements factor (30%)
    if (skillRequirements.length > 8) {
      score += 30;
      factors.push('Çok sayıda yetenek gereksinimi');
    } else if (skillRequirements.length > 5) {
      score += 20;
      factors.push('Orta sayıda yetenek gereksinimi');
    }

    // Dependencies factor (25%)
    if (dependencies > 10) {
      score += 25;
      factors.push('Yüksek bağımlılık');
    } else if (dependencies > 5) {
      score += 15;
      factors.push('Orta bağımlılık');
    }

    let complexity: 'low' | 'medium' | 'high';
    if (score >= 70) {
      complexity = 'high';
    } else if (score >= 40) {
      complexity = 'medium';
    } else {
      complexity = 'low';
    }

    return { complexity, score, factors };
  }

  // Format prediction result
  static formatPredictionResult(value: number, type: 'salary' | 'hours' | 'percentage'): string {
    switch (type) {
      case 'salary':
        return `₺${value.toLocaleString('tr-TR')}`;
      case 'hours':
        return `${value} saat`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  }

  // Validate AI input data
  static validateInputData(data: any[], requiredFields: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Veri bir dizi olmalıdır');
      return { isValid: false, errors };
    }

    if (data.length === 0) {
      errors.push('Veri dizisi boş olamaz');
      return { isValid: false, errors };
    }

    data.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`Veri ${index + 1}. öğe bir nesne olmalıdır`);
        return;
      }

      requiredFields.forEach(field => {
        if (!(field in item)) {
          errors.push(`Veri ${index + 1}. öğede '${field}' alanı eksik`);
        }
      });
    });

    return { isValid: errors.length === 0, errors };
  }

  // Calculate prediction confidence based on data quality
  static calculateDataConfidence(data: any[]): number {
    if (!Array.isArray(data) || data.length === 0) return 0;

    let confidence = 0;
    
    // Data quantity factor (40%)
    const dataPoints = data.length;
    if (dataPoints >= 100) {
      confidence += 40;
    } else if (dataPoints >= 50) {
      confidence += 30;
    } else if (dataPoints >= 20) {
      confidence += 20;
    } else if (dataPoints >= 10) {
      confidence += 10;
    }

    // Data completeness factor (30%)
    const completeRecords = data.filter(item => 
      Object.values(item).every(value => value !== null && value !== undefined)
    ).length;
    const completenessRatio = completeRecords / dataPoints;
    confidence += completenessRatio * 30;

    // Data consistency factor (30%)
    // Simplified consistency check based on numeric fields
    const numericFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );
    
    if (numericFields.length > 0) {
      let consistencyScore = 0;
      numericFields.forEach(field => {
        const values = data.map(item => item[field]).filter(val => !isNaN(val));
        if (values.length > 0) {
          const stats = this.calculateStatistics(values);
          const cv = stats.stdDev / stats.mean;
          consistencyScore += Math.max(0, 1 - cv);
        }
      });
      consistencyScore = (consistencyScore / numericFields.length) * 30;
      confidence += consistencyScore;
    } else {
      confidence += 15; // Default for non-numeric data
    }

    return Math.min(100, Math.max(0, confidence));
  }

  // Generate AI insights summary
  static generateInsightsSummary(insights: any[]): {
    totalInsights: number;
    categoryDistribution: Record<string, number>;
    severityDistribution: Record<string, number>;
    topInsights: any[];
  } {
    const categoryDistribution: Record<string, number> = {};
    const severityDistribution: Record<string, number> = {};

    insights.forEach(insight => {
      categoryDistribution[insight.category] = (categoryDistribution[insight.category] || 0) + 1;
      severityDistribution[insight.severity] = (severityDistribution[insight.severity] || 0) + 1;
    });

    // Sort insights by confidence and take top 5
    const topInsights = [...insights]
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 5);

    return {
      totalInsights: insights.length,
      categoryDistribution,
      severityDistribution,
      topInsights
    };
  }
}

// Export singleton instance
export const aiHelpers = AIHelpers;
