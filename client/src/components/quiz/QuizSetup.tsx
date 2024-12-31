import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { DifficultyLevel } from '@db/schema';

interface QuizSetupProps {
  onStart: (config: {
    numQuestions: number;
    category?: string;
    difficulty?: DifficultyLevel;
  }) => void;
  categories: string[];
}

export function QuizSetup({ onStart, categories }: QuizSetupProps) {
  const [numQuestions, setNumQuestions] = useState<string>('3');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quiz Setup</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your quiz experience by selecting the number of questions,
          category, and difficulty level.
        </p>
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

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select 
            value={difficulty} 
            onValueChange={(val) => setDifficulty(val as DifficultyLevel | 'all')}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full ripple-button"
          onClick={() => onStart({
            numQuestions: parseInt(numQuestions),
            category: category === 'all' ? undefined : category,
            difficulty: difficulty === 'all' ? undefined : difficulty,
          })}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}