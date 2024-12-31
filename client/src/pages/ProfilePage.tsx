import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillRadar } from '@/components/profile/SkillRadar';
import { ShareButtons } from '@/components/ui/ShareButtons';
import CredentialsManager from '@/components/profile/CredentialsManager';
import ResumeGenerator from '@/components/profile/ResumeGenerator';
import SkillEndorsement from '@/components/profile/SkillEndorsement';
import { useUser } from '@/hooks/use-user';
import { Loader2, Trophy, Target, Award, Brain } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define types for our data
interface Achievement {
  id: number;
  name: string;
  description: string;
}

interface ProgressItem {
  id: number;
  correct: boolean;
  question?: {
    category: string;
  };
}

// Sample skills data - in a real app, this would come from the API
const skillsData = [
  { subject: 'Water Treatment', level: 85, fullMark: 100 },
  { subject: 'Quality Control', level: 75, fullMark: 100 },
  { subject: 'Sustainability', level: 90, fullMark: 100 },
  { subject: 'Regulations', level: 70, fullMark: 100 },
  { subject: 'Innovation', level: 80, fullMark: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProfilePage() {
  const { user } = useUser();

  const { data: achievements = [], isLoading: loadingAchievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const { data: progress = [], isLoading: loadingProgress } = useQuery<ProgressItem[]>({
    queryKey: ['/api/progress'],
  });

  if (!user || loadingAchievements || loadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalQuestions = progress.length;
  const correctAnswers = progress.filter((p) => p.correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Calculate category statistics
  const categoryStats = progress.reduce((acc: Record<string, { total: number; correct: number }>, p) => {
    const category = p.question?.category || 'Unknown';
    if (!acc[category]) {
      acc[category] = { total: 0, correct: 0 };
    }
    acc[category].total++;
    if (p.correct) acc[category].correct++;
    return acc;
  }, {});

  const pieData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category,
    value: stats.total,
  }));

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out my Water.AI profile! ${accuracy.toFixed(1)}% accuracy across ${totalQuestions} questions 💧`;
  const shareDescription = `I'm mastering water sector skills on Water.AI! Join me in making a difference in water management and sustainability.`;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Professional Profile</h1>
        <ShareButtons 
          url={shareUrl}
          title={shareTitle}
          description={shareDescription}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-blue-700">Accuracy</p>
                  <p className="text-2xl font-bold text-blue-900">{accuracy.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-green-700">Current Streak</p>
                  <p className="text-2xl font-bold text-green-900">{user.streak || 0} 🔥</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-purple-700">Total Points</p>
                  <p className="text-2xl font-bold text-purple-900">{user.points || 0}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-orange-700">Questions Answered</p>
                  <p className="text-2xl font-bold text-orange-900">{totalQuestions}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Category Progress</h3>
                {Object.entries(categoryStats).map(([category, stats], index) => (
                  <div key={category} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category}</span>
                      <span>{((stats.correct / stats.total) * 100).toFixed(1)}% correct</span>
                    </div>
                    <Progress 
                      value={(stats.correct / stats.total) * 100} 
                      className="h-2"
                      indicatorColor={COLORS[index % COLORS.length]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ResumeGenerator />
          <CredentialsManager />
          <SkillRadar skills={skillsData} className="bg-white rounded-lg shadow-lg p-4" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <SkillEndorsement userId={user.id} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Achievements</CardTitle>
              {achievements.length > 0 && (
                <ShareButtons 
                  url={shareUrl}
                  title={`I've earned ${achievements.length} achievements on Water.AI! 🏆`}
                  description="Join me in learning about water management and earning professional achievements!"
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-gray-600 col-span-2 text-center py-8">
                    No achievements yet. Keep playing to earn badges!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}