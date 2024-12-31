import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@db/schema';
import { AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();

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
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase">{question.category}</span>
          <span className="text-sm uppercase">{question.difficulty}</span>
        </div>
        <h2 className="text-xl font-semibold mt-2">{question.question}</h2>
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

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium text-blue-900">Learn More:</h4>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {question.explanation || "No explanation available for this question."}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full ripple-button"
          onClick={handleSubmit}
          disabled={isAnswered}
        >
          Submit Answer
        </Button>
      </CardFooter>
    </Card>
  );
}