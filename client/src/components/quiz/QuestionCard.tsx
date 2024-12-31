import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/ui/ShareButtons';
import type { Question } from '@db/schema';
import { AlertCircle, CheckCircle2, BookOpen, Share2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleSubmit = () => {
    if (!answer) {
      toast({
        title: 'Error',
        description: 'Please select or enter an answer',
        variant: 'destructive',
      });
      return;
    }
    setIsAnswered(true);
    onSubmit(answer);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm uppercase">{question.category}</span>
            <span className="mx-2">•</span>
            <span className="text-sm uppercase">{question.difficulty}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-white/80"
            onClick={() => setShowShare(!showShare)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        <h2 className="text-xl font-semibold">{question.question}</h2>
        {showShare && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <ShareButtons 
              url={shareUrl}
              title={`Can you answer this water knowledge question: ${question.question}`}
              description={`Test your water sector knowledge with this question about ${question.category}!`}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {question.type === 'multiple_choice' && question.options && (
          <RadioGroup onValueChange={setAnswer} value={answer} disabled={isAnswered}>
            {(question.options as string[]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <RadioGroupItem id={`option-${index}`} value={option} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'true_false' && (
          <RadioGroup onValueChange={setAnswer} value={answer} disabled={isAnswered}>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem id="true" value="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem id="false" value="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        )}

        {question.type === 'short_answer' && (
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAnswered}
          />
        )}

        {isAnswered && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'text-green-700' : 'text-red-700'}`}>
                    {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'Correct Answer!' : 'Incorrect Answer'}
                  </h3>
                  <p className="text-sm mt-1">
                    The correct answer is: <span className="font-medium">{question.correctAnswer}</span>
                  </p>
                </div>
              </div>
            </div>

            {question.explanation && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-blue-900">Learn More</h4>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                  {question.explanation}
                </p>
                <p className="text-xs text-blue-600 mt-4 italic">
                  Powered by Water.AI - All rights reserved 2024
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full ripple-button"
          onClick={handleSubmit}
          disabled={isAnswered || !answer}
        >
          Submit Answer
        </Button>
      </CardFooter>
    </Card>
  );
}