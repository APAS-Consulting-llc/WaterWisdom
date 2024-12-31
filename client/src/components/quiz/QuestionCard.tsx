import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@db/schema';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
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
          <RadioGroup onValueChange={setAnswer} value={answer}>
            {(question.options as string[]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <RadioGroupItem id={`option-${index}`} value={option} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === 'true_false' && (
          <RadioGroup onValueChange={setAnswer} value={answer}>
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
          />
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full ripple-button"
          onClick={handleSubmit}
        >
          Submit Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
