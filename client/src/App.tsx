import { Switch, Route } from 'wouter';
import { useUser } from './hooks/use-user';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import SubmitQuestionPage from './pages/SubmitQuestionPage';
import LearningPathsPage from './pages/LearningPathsPage';
import { Navigation } from './components/layout/Navigation';
import { Loader2 } from 'lucide-react';
import './styles/animations.css';

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

  return (
    <div className="min-h-screen bg-gray-50 wave-bg">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/quiz" component={QuizPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/submit-question" component={SubmitQuestionPage} />
          <Route path="/learning-paths" component={LearningPathsPage} />
          {user.role === 'admin' && (
            <Route path="/admin" component={AdminPage} />
          )}
          <Route>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
              <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;