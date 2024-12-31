import { useState } from 'react';
import { useQuiz } from '@/hooks/use-quiz';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Question } from '@db/schema';

export default function QuizPage() {
  const { questions, isLoading, submitAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
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

  const handleSubmit = async (answer: string) => {
    try {
      const result = await submitAnswer({
        questionId: currentQuestion.id,
        answer
      });

      if (result.correct) {
        setStreak(prev => prev + 1);
        toast({
          title: 'Correct!',
          description: 'Great job! Keep going!',
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

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({
          title: 'Quiz Complete!',
          description: 'You have completed all questions.',
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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        streak={streak}
      />
      <QuestionCard
        question={currentQuestion}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
