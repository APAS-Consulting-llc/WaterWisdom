import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useUser } from '@/hooks/use-user';
import { Droplets, Palette, UserCircle } from 'lucide-react';
import DelphiProfile from '@/components/profile/DelphiProfile';
import MicroLearning from '@/components/learning/MicroLearning';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {user && <DelphiProfile />}
      {user && <div className="mb-8"><MicroLearning /></div>}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Droplets className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-3xl mb-2">Welcome to One Water.AI</CardTitle>
          <p className="text-muted-foreground">
            Dive into the fascinating world of water knowledge! Our interactive trivia platform is designed
            to help water sector professionals and enthusiasts deepen their understanding of water treatment,
            conservation, and environmental impact through engaging questions and detailed explanations.
            Together, we can promote water literacy and sustainable practices for a better future.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid gap-4 max-w-lg mx-auto">
            <Button asChild className="w-full" size="lg">
              <Link href="/quiz">Start Quiz</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/theme">
                <Palette className="w-4 h-4 mr-2" />
                Customize Theme
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/portfolio">
                <UserCircle className="w-4 h-4 mr-2" />
                Generate Portfolio
              </Link>
            </Button>
            {user && (
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/submit-question">Submit a Question</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learn as You Play</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Each question comes with detailed explanations, helping you understand the science and
              best practices behind water management. Track your progress and earn achievements as you learn!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community-Driven Knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our questions are curated by water sector experts and professionals. As a registered user,
              you can contribute your own questions to help build our knowledge base and share your expertise
              with the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}