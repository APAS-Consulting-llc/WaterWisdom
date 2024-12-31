import { useState } from 'react';
import { useQuiz } from '@/hooks/use-quiz';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Question, DifficultyLevel } from '@db/schema';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>();
  const { questions, isLoading, submitAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDifficultyChange, setShowDifficultyChange] = useState<{
    from: DifficultyLevel;
    to: DifficultyLevel;
  } | null>(null);
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

  const filteredQuestions = questions.filter(q => {
    if (selectedCategory && q.category !== selectedCategory) return false;
    if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const selectedQuestions = !quizStarted ? [] : filteredQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, maxQuestions);

  const currentQuestion: Question | undefined = selectedQuestions[currentIndex];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const categories = Array.from(new Set(questions.map(q => q.category)));

  const handleStartQuiz = (config: {
    numQuestions: number;
    category?: string;
    difficulty?: DifficultyLevel;
  }) => {
    setMaxQuestions(config.numQuestions);
    setSelectedCategory(config.category);
    setSelectedDifficulty(config.difficulty || 'beginner');
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setShowDifficultyChange(null);
    setShowExplanation(false);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
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
    if (!currentQuestion || !selectedDifficulty) return;

    try {
      const result = await submitAnswer({
        questionId: currentQuestion.id,
        answer,
        category: currentQuestion.category,
        difficulty: selectedDifficulty,
        currentStreak: streak
      });

      if ('correct' in result) {
        const points = calculatePoints(currentQuestion.difficulty, streak + 1);
        setScore(prev => prev + points);
        setStreak(prev => result.correct ? prev + 1 : 0);
        setShowExplanation(true);

        if (result.recommendedDifficulty !== selectedDifficulty) {
          setShowDifficultyChange({
            from: selectedDifficulty,
            to: result.recommendedDifficulty
          });
          setSelectedDifficulty(result.recommendedDifficulty);
        }

        toast({
          title: result.correct ? `Correct! +${points} points` : 'Incorrect',
          description: result.correct 
            ? `Keep going! You're on a ${streak + 1} question streak! 🔥`
            : 'Keep learning! Review the explanation below.',
          variant: result.correct ? 'default' : 'destructive'
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
    return <QuizSetup onStart={handleStartQuiz} categories={categories} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-right mb-4">
        <span className="text-2xl font-bold text-blue-500">Score: {score}</span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={maxQuestions}
        streak={streak}
      />

      {showDifficultyChange && (
        <Alert className="mb-4">
          <AlertTitle className="flex items-center gap-2">
            {showDifficultyChange.from === 'beginner' ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-orange-500" />
            )}
            Difficulty Adjusted
          </AlertTitle>
          <AlertDescription>
            Based on your performance, the difficulty has been adjusted from{' '}
            <span className="font-medium">{showDifficultyChange.from}</span> to{' '}
            <span className="font-medium">{showDifficultyChange.to}</span>.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg -z-10" />
        {currentQuestion && (
          <>
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmit}
            />
            {showExplanation && currentQuestion.explanation && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Learn More</h3>
                <p className="text-gray-700">{currentQuestion.explanation}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Share this question:</h4>
                  <ShareButtons 
                    url={shareUrl}
                    title={`Test your water knowledge! Can you answer this question about ${currentQuestion.category}?`}
                    description={currentQuestion.question}
                  />
                </div>
              </div>
            )}
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