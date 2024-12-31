import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./hooks/use-user";
import { queryClient } from "./lib/queryClient";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/settings";
import SubmitQuestionPage from "./pages/SubmitQuestionPage";
import LearningPathsPage from "./pages/LearningPathsPage";
import ForumPage from "./pages/ForumPage";
import ChatBoard from "./pages/ChatBoard";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import CommunityPage from "./pages/CommunityPage";
import ThemePage from "./pages/ThemePage";
import { Navigation } from "./components/layout/Navigation";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // If user tries to access admin route without admin role, redirect them to home
  if (window.location.pathname === '/admin' && user.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-16">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/quiz" component={QuizPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/theme" component={ThemePage} />
          <Route path="/submit-question" component={SubmitQuestionPage} />
          <Route path="/learning-paths" component={LearningPathsPage} />
          <Route path="/forum" component={ForumPage} />
          <Route path="/chat" component={ChatBoard} />
          <Route path="/knowledge" component={KnowledgeBasePage} />
          <Route path="/community" component={CommunityPage} />
          {user.role === 'admin' && (
            <Route path="/admin" component={AdminPage} />
          )}
          <Route>
            {() => (
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
                <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
              </div>
            )}
          </Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;