import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QuizSetupProps {
  onStart: (numQuestions: number) => void;
}

export function QuizSetup({ onStart }: QuizSetupProps) {
  const [numQuestions, setNumQuestions] = useState<string>('3');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quiz Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="num-questions">Number of Questions</Label>
          <Select 
            value={numQuestions} 
            onValueChange={setNumQuestions}
          >
            <SelectTrigger id="num-questions">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Question</SelectItem>
              <SelectItem value="2">2 Questions</SelectItem>
              <SelectItem value="3">3 Questions</SelectItem>
              <SelectItem value="4">4 Questions</SelectItem>
              <SelectItem value="5">5 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="w-full"
          onClick={() => onStart(parseInt(numQuestions))}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
