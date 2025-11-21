// Workload Optimizer Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Settings
} from 'lucide-react';
import { useWorkloadAnalysis } from '../../hooks/useAI';
import { useScheduleOptimization } from '../../hooks/useAI';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../utils/logger';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  currentWorkload: number;
  maxWorkload: number;
  efficiency: number;
  avatar?: string;
}

interface ProjectRequirement {
  id: string;
  name: string;
  requiredSkills: string[];
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  assignedTo?: string[];
}

interface OptimizationResult {
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

export const WorkloadOptimizer: React.FC = () => {
  const { user } = useAuth();
  const { workloadData, analyzeWorkload, loading: workloadLoading } = useWorkloadAnalysis(user?.id || '');
  const { optimizedSchedule, optimizeSchedule, loading: optimizationLoading } = useScheduleOptimization();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<ProjectRequirement[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [timeRange, setTimeRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock team members
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        role: 'Senior Developer',
        skills: ['React', 'TypeScript', 'Node.js'],
        currentWorkload: 85,
        maxWorkload: 100,
        efficiency: 92
      },
      {
        id: '2',
        name: 'Ayşe Demir',
        role: 'Frontend Developer',
        skills: ['React', 'CSS', 'UI/UX'],
        currentWorkload: 75,
        maxWorkload: 100,
        efficiency: 88
      },
      {
        id: '3',
        name: 'Mehmet Kaya',
        role: 'Backend Developer',
        skills: ['Node.js', 'Python', 'Database'],
        currentWorkload: 95,
        maxWorkload: 100,
        efficiency: 85
      },
      {
        id: '4',
        name: 'Zeynep Öztürk',
        role: 'DevOps Engineer',
        skills: ['Docker', 'AWS', 'CI/CD'],
        currentWorkload: 70,
        maxWorkload: 100,
        efficiency: 90
      },
      {
        id: '5',
        name: 'Ali Veli',
        role: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'Python'],
        currentWorkload: 80,
        maxWorkload: 100,
        efficiency: 87
      }
    ];

    // Mock projects
    const mockProjects: ProjectRequirement[] = [
      {
        id: '1',
        name: 'E-Ticaret Platformu',
        requiredSkills: ['React', 'Node.js', 'Database'],
        estimatedHours: 120,
        priority: 'high',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: '2',
        name: 'Mobil Uygulama',
        requiredSkills: ['React', 'TypeScript', 'UI/UX'],
        estimatedHours: 80,
        priority: 'medium',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: '3',
        name: 'API Geliştirme',
        requiredSkills: ['Node.js', 'Python', 'Database'],
        estimatedHours: 60,
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: '4',
        name: 'Dashboard Optimizasyonu',
        requiredSkills: ['React', 'CSS', 'UI/UX'],
        estimatedHours: 40,
        priority: 'low',
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: '5',
        name: 'CI/CD Pipeline',
        requiredSkills: ['Docker', 'AWS', 'CI/CD'],
        estimatedHours: 30,
        priority: 'medium',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    setTeamMembers(mockTeamMembers);
    setProjects(mockProjects);
  };

  const runOptimization = async () => {
    try {
      logger.info('Starting workload optimization', { teamSize: teamMembers.length, projectCount: projects.length }, 'WorkloadOptimizer');

      // Convert data for AI service
      const teamData = teamMembers.map(member => ({
        userId: member.id,
        skills: member.skills,
        maxWorkload: member.maxWorkload,
        preferences: []
      }));

      const projectRequirements = projects.map(project => ({
        skill: project.requiredSkills.join(','),
        hours: project.estimatedHours,
        priority: project.priority
      }));

      await optimizeSchedule(teamData, projectRequirements, timeRange);

      // Generate mock optimization result
      const mockResult: OptimizationResult = {
        totalEfficiency: 89.5,
        savings: {
          hours: 24,
          cost: 2400
        },
        recommendations: [
          'Mehmet Kaya\'nın iş yükünü %15 azaltmak için API projesini Ali Veli\'ye transfer et',
          'Ayşe Demir\'in UI/UX becerilerini mobil uygulama projesinde daha fazla kullan',
          'Zeynep Öztürk\'ün kapasitesini artırmak için CI/CD projesini önceliklendir',
          'E-ticaret projesi için Ahmet Yılmaz ve Ali Veli arasında iş birliği oluştur'
        ],
        risks: [
          'Mehmet Kaya\'nın yüksek iş yükü burnout riski taşıyor',
          'E-ticaret projesinin teslim tarihi kritik - kaynak yetersizliği riski',
          'Mobil uygulama projesinde UI/UX uzmanlığı eksikliği'
        ],
        optimizedSchedule: [
          { memberId: '1', projectId: '1', allocatedHours: 40, efficiency: 92 },
          { memberId: '1', projectId: '3', allocatedHours: 20, efficiency: 88 },
          { memberId: '2', projectId: '2', allocatedHours: 35, efficiency: 90 },
          { memberId: '2', projectId: '4', allocatedHours: 25, efficiency: 85 },
          { memberId: '3', projectId: '3', allocatedHours: 30, efficiency: 82 },
          { memberId: '4', projectId: '5', allocatedHours: 25, efficiency: 91 },
          { memberId: '5', projectId: '1', allocatedHours: 35, efficiency: 89 },
          { memberId: '5', projectId: '3', allocatedHours: 10, efficiency: 86 }
        ]
      };

      setOptimizationResult(mockResult);
      
      logger.info('Workload optimization completed', { 
        efficiency: mockResult.totalEfficiency,
        savings: mockResult.savings 
      }, 'WorkloadOptimizer');
    } catch (error) {
      logger.error('Workload optimization failed', error, 'WorkloadOptimizer');
    }
  };

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'text-red-600';
    if (percentage > 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillMatch = (memberSkills: string[], requiredSkills: string[]) => {
    const matchCount = requiredSkills.filter(skill => memberSkills.includes(skill)).length;
    return (matchCount / requiredSkills.length) * 100;
  };

  const isLoading = workloadLoading || optimizationLoading;

  return (
    <div className=\"space-y-6 p-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center space-x-2\">
          <Target className=\"h-6 w-6 text-blue-600\" />
          <h1 className=\"text-2xl font-bold\">İş Yükü Optimizatörü</h1>
        </div>
        <div className=\"flex items-center space-x-2\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className=\"h-4 w-4 mr-2\" />
            {showAdvanced ? 'Basit' : 'Gelişmiş'}
          </Button>
          <Button onClick={runOptimization} disabled={isLoading}>
            <Zap className=\"h-4 w-4 mr-2\" />
            {isLoading ? 'Optimize Ediliyor...' : 'Optimize Et'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Ekip Verimliliği</p>
                <p className=\"text-2xl font-bold\">{optimizationResult?.totalEfficiency || 87}%</p>
              </div>
              <TrendingUp className=\"h-8 w-8 text-green-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Tasarruf Edilen Saat</p>
                <p className=\"text-2xl font-bold\">{optimizationResult?.savings.hours || 0}h</p>
              </div>
              <Clock className=\"h-8 w-8 text-blue-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Maliyet Tasarrufu</p>
                <p className=\"text-2xl font-bold\">₺{optimizationResult?.savings.cost || 0}</p>
              </div>
              <BarChart3 className=\"h-8 w-8 text-purple-500\" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Risk Sayısı</p>
                <p className=\"text-2xl font-bold\">{optimizationResult?.risks.length || 0}</p>
              </div>
              <AlertTriangle className=\"h-8 w-8 text-orange-500\" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <Users className=\"h-5 w-5\" />
            <span>Ekip Üyeleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
            {teamMembers.map((member) => (
              <div key={member.id} className=\"border rounded-lg p-4 space-y-3\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <h3 className=\"font-medium\">{member.name}</h3>
                    <p className=\"text-sm text-gray-600\">{member.role}</p>
                  </div>
                  <div className=\"text-right\">
                    <p className={`text-sm font-bold ${getWorkloadColor(member.currentWorkload, member.maxWorkload)}`}>
                      {member.currentWorkload}%
                    </p>
                    <p className=\"text-xs text-gray-500\">İş Yükü</p>
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <div className=\"flex justify-between text-sm\">
                    <span>Verimlilik</span>
                    <span>{member.efficiency}%</span>
                  </div>
                  <Progress value={member.efficiency} className=\"h-2\" />
                </div>

                <div className=\"space-y-1\">
                  <p className=\"text-sm font-medium\">Yetenekler:</p>
                  <div className=\"flex flex-wrap gap-1\">
                    {member.skills.map((skill, idx) => (
                      <Badge key={idx} variant=\"secondary\" className=\"text-xs\">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <Target className=\"h-5 w-5\" />
            <span>Proje Gereksinimleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"space-y-3\">
            {projects.map((project) => (
              <div key={project.id} className=\"border rounded-lg p-4\">
                <div className=\"flex items-center justify-between mb-3\">
                  <div>
                    <h3 className=\"font-medium\">{project.name}</h3>
                    <div className=\"flex items-center space-x-2 mt-1\">
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority.toUpperCase()}
                      </Badge>
                      <span className=\"text-sm text-gray-600\">{project.estimatedHours} saat</span>
                      <span className=\"text-sm text-gray-600\">Son teslim: {project.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <p className=\"text-sm font-medium\">Gerekli Yetenekler:</p>
                  <div className=\"flex flex-wrap gap-1\">
                    {project.requiredSkills.map((skill, idx) => (
                      <Badge key={idx} variant=\"outline\" className=\"text-xs\">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skill matching with team members */}
                <div className=\"mt-3 space-y-2\">
                  <p className=\"text-sm font-medium\">Ekip Uyumu:</p>
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-2\">
                    {teamMembers
                      .map(member => ({
                        ...member,
                        match: getSkillMatch(member.skills, project.requiredSkills)
                      }))
                      .filter(member => member.match > 0)
                      .sort((a, b) => b.match - a.match)
                      .slice(0, 3)
                      .map((member) => (
                        <div key={member.id} className=\"flex items-center justify-between p-2 bg-gray-50 rounded\">
                          <span className=\"text-sm\">{member.name}</span>
                          <div className=\"flex items-center space-x-2\">
                            <Progress value={member.match} className=\"h-1 w-16\" />
                            <span className=\"text-xs text-gray-600\">{Math.round(member.match)}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center space-x-2\">
                <CheckCircle className=\"h-5 w-5 text-green-500\" />
                <span>Öneriler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                {optimizationResult.recommendations.map((rec, index) => (
                  <div key={index} className=\"flex items-start space-x-2 p-3 bg-green-50 rounded-lg\">
                    <CheckCircle className=\"h-5 w-5 text-green-500 mt-0.5\" />
                    <span className=\"text-sm\">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risks */}
          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center space-x-2\">
                <AlertTriangle className=\"h-5 w-5 text-orange-500\" />
                <span>Riskler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                {optimizationResult.risks.map((risk, index) => (
                  <Alert key={index} className=\"border-orange-200 bg-orange-50\">
                    <AlertTriangle className=\"h-4 w-4\" />
                    <AlertDescription>{risk}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimized Schedule */}
      {optimizationResult && (
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Calendar className=\"h-5 w-5\" />
              <span>Optimize Edilmiş Çizelge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-4\">
              {optimizationResult.optimizedSchedule.map((assignment, index) => {
                const member = teamMembers.find(m => m.id === assignment.memberId);
                const project = projects.find(p => p.id === assignment.projectId);
                
                return (
                  <div key={index} className=\"flex items-center justify-between p-3 border rounded-lg\">
                    <div className=\"flex items-center space-x-4\">
                      <div>
                        <p className=\"font-medium\">{member?.name}</p>
                        <p className=\"text-sm text-gray-600\">{member?.role}</p>
                      </div>
                      <div className=\"text-center\">
                        <p className=\"font-medium\">{project?.name}</p>
                        <p className=\"text-sm text-gray-600\">{assignment.allocatedHours} saat</p>
                      </div>
                    </div>
                    <div className=\"text-right\">
                      <div className=\"flex items-center space-x-2\">
                        <span className=\"text-sm font-medium\">Verimlilik:</span>
                        <span className=\"text-sm font-bold\">{assignment.efficiency}%</span>
                      </div>
                      <Progress value={assignment.efficiency} className=\"h-2 w-20 mt-1\" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
