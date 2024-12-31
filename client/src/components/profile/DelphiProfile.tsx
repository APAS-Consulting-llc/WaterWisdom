import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function DelphiProfile() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Delphi.ai Profile</span>
          <Button variant="ghost" size="sm" asChild>
            <a 
              href="https://www.delphi.ai/hardeepanand" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <span>View Full Profile</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Hardeep Anand</h3>
            <p className="text-muted-foreground mb-4">
              Water Sector Professional & Technology Expert
            </p>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Expertise:</span>
                <span className="ml-2 text-muted-foreground">Water Treatment, Conservation, Environmental Impact</span>
              </div>
              <div>
                <span className="font-medium">Focus Areas:</span>
                <span className="ml-2 text-muted-foreground">Professional Development, Knowledge Sharing, Community Building</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-3">
            <Button asChild className="w-full md:w-auto">
              <a href="/chat" className="min-w-[200px] justify-center">
                Start AI Chat
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <a href="/forum" className="min-w-[200px] justify-center">
                Join Discussion
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
