import { useState } from 'react';
import { useQuiz } from '@/hooks/use-quiz';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Question, DifficultyLevel } from '@db/schema';

export default function QuizPage() {
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
  const { questions, isLoading, submitAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No questions available</h2>
        <p className="mt-2 text-gray-600">Please check back later</p>
      </div>
    );
  }

  const currentQuestion: Question = questions[currentIndex];

  const calculatePoints = (difficulty: string, streakCount: number) => {
    const basePoints = {
      'beginner': 10,
      'intermediate': 20,
      'expert': 30
    }[difficulty] || 10;

    const streakBonus = Math.floor(streakCount / 5) * 5; // Bonus points for every 5 correct answers
    return basePoints + streakBonus;
  };

  const handleSubmit = async (answer: string) => {
    try {
      const result = await submitAnswer({
        questionId: currentQuestion.id,
        answer
      });

      if (result.correct) {
        const points = calculatePoints(currentQuestion.difficulty, streak + 1);
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        toast({
          title: `Correct! +${points} points`,
          description: `Streak: ${streak + 1} 🔥`,
          variant: 'default'
        });
      } else {
        setStreak(0);
        toast({
          title: 'Incorrect',
          description: `The correct answer was: ${currentQuestion.correctAnswer}`,
          variant: 'destructive'
        });
      }

      // Move to next question or end quiz
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({
          title: 'Quiz Complete! 🎉',
          description: `Final Score: ${score} points`,
          variant: 'default'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive'
      });
    }
  };

  const categories = Array.from(new Set(questions.map(q => q.category)));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={(val) => setDifficulty(val as DifficultyLevel)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="text-right mb-4">
        <span className="text-2xl font-bold text-blue-500">Score: {score}</span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        streak={streak}
      />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg -z-10" />
        <QuestionCard
          question={currentQuestion}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}