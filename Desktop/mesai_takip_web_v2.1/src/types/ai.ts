// AI Related Type Definitions

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

export interface SmartNotification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    action: string;
    callback?: () => void;
  };
  category: 'workload' | 'performance' | 'deadline' | 'system' | 'wellness';
}

export interface AIRecommendation {
  id: string;
  type: 'workload' | 'training' | 'wellness' | 'performance';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actions: string[];
  createdAt: string;
  status: 'pending' | 'acknowledged' | 'completed' | 'dismissed';
}

export interface PerformancePrediction {
  currentScore: number;
  predictedScore: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    value: number;
  }[];
  recommendations: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  currentWorkload: number;
  maxWorkload: number;
  efficiency: number;
  avatar?: string;
}

export interface ProjectRequirement {
  id: string;
  name: string;
  requiredSkills: string[];
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  assignedTo?: string[];
}

export interface OptimizationResult {
  totalEfficiency: number;
  savings: {
    hours: number;
    cost: number;
  };
  recommendations: string[];
  risks: string[];
  optimizedSchedule: {
    memberId: string;
    projectId: string;
    allocatedHours: number;
    efficiency: number;
  }[];
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  data: any;
  confidence: number;
  timestamp: string;
  category: string;
}

export interface AIMetrics {
  totalPredictions: number;
  accuracy: number;
  anomaliesDetected: number;
  recommendationsGenerated: number;
  userSatisfaction: number;
  timeSaved: number;
  costSavings: number;
}

export interface AIConfig {
  enablePredictions: boolean;
  enableAnomalyDetection: boolean;
  enableSmartNotifications: boolean;
  enableWorkloadOptimization: boolean;
  notificationCategories: string[];
  predictionFrequency: 'daily' | 'weekly' | 'monthly';
  anomalyThreshold: number;
  confidenceThreshold: number;
}

export interface AIModelConfig {
  name: string;
  version: string;
  type: 'regression' | 'classification' | 'clustering' | 'anomaly_detection';
  features: string[];
  target: string;
  accuracy: number;
  lastTrained: string;
  isActive: boolean;
}

export interface AIModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix?: number[][];
  featureImportance?: {
    feature: string;
    importance: number;
  }[];
}

export interface AIDataPoint {
  timestamp: string;
  userId: string;
  features: Record<string, any>;
  target?: any;
  prediction?: any;
  actual?: any;
  error?: number;
}

export interface AIExperiment {
  id: string;
  name: string;
  description: string;
  modelConfig: AIModelConfig;
  startDate: string;
  endDate?: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  metrics?: AIModelMetrics;
  results?: any[];
}

export interface AIInsightTemplate {
  id: string;
  name: string;
  description: string;
  type: AIInsight['type'];
  category: string;
  template: string;
  variables: string[];
  conditions: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'regex';
    value: any;
  }[];
  actions: {
    type: 'notification' | 'recommendation' | 'alert';
    config: any;
  }[];
}

export interface AIFeedback {
  id: string;
  insightId: string;
  userId: string;
  rating: number; // 1-5
  feedback: string;
  helpful: boolean;
  timestamp: string;
}

export interface AIModelTrainingData {
  features: Record<string, any>[];
  target: any[];
  metadata: {
    source: string;
    dateRange: string;
    recordCount: number;
    quality: 'high' | 'medium' | 'low';
  };
}

export interface AIPredictionRequest {
  modelId: string;
  features: Record<string, any>;
  userId?: string;
  context?: Record<string, any>;
}

export interface AIPredictionResponse {
  prediction: any;
  confidence: number;
  explanation?: string;
  features?: {
    name: string;
    value: any;
    importance: number;
  }[];
  requestId: string;
  timestamp: string;
}

export interface AIAnomalyDetectionRequest {
  data: any[];
  algorithm: 'isolation_forest' | 'z_score' | 'iqr' | 'custom';
  threshold?: number;
  features?: string[];
}

export interface AIAnomalyDetectionResponse {
  anomalies: {
    index: number;
    score: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  summary: {
    totalAnomalies: number;
    anomalyRate: number;
    averageScore: number;
  };
  requestId: string;
  timestamp: string;
}

export interface AIRecommendationRequest {
  userId: string;
  context: {
    workload?: number;
    performance?: number;
    skills?: string[];
    goals?: string[];
  };
  type?: 'workload' | 'training' | 'wellness' | 'performance';
  limit?: number;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  summary: {
    totalRecommendations: number;
    priorityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
  };
  requestId: string;
  timestamp: string;
}
