import { useState } from 'react';
import { useQuiz } from '@/hooks/use-quiz';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Question, DifficultyLevel } from '@db/schema';

export default function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(3);
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

  // Randomly select maxQuestions number of questions
  const selectedQuestions = !quizStarted ? [] : questions
    .sort(() => Math.random() - 0.5)
    .slice(0, maxQuestions);

  const currentQuestion: Question | undefined = selectedQuestions[currentIndex];

  const handleStartQuiz = (numQuestions: number) => {
    setMaxQuestions(numQuestions);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
  };

  const handleNextQuestion = () => {
    if (currentIndex < maxQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast({
        title: 'Quiz Complete! 🎉',
        description: `Final Score: ${score} points`,
        variant: 'default'
      });
      setQuizStarted(false);
    }
  };

  const calculatePoints = (difficulty: string, streakCount: number) => {
    const basePoints = {
      'beginner': 10,
      'intermediate': 20,
      'expert': 30
    }[difficulty] || 10;

    const streakBonus = Math.floor(streakCount / 5) * 5;
    return basePoints + streakBonus;
  };

  const handleSubmit = async (answer: string) => {
    if (!currentQuestion) return;

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
          description: `Keep going! You're on a ${streak + 1} question streak! 🔥`,
          variant: 'default'
        });
      } else {
        setStreak(0);
        toast({
          title: 'Incorrect',
          description: 'Keep learning! Review the explanation below.',
          variant: 'destructive'
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

  if (!quizStarted) {
    return <QuizSetup onStart={handleStartQuiz} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-right mb-4">
        <span className="text-2xl font-bold text-blue-500">Score: {score}</span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={maxQuestions}
        streak={streak}
      />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg -z-10" />
        {currentQuestion && (
          <>
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmit}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleNextQuestion}>
                {currentIndex < maxQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}