import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useUser();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <nav className="w-full bg-white border-b px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <a className="text-xl font-bold text-blue-500">WaterQuiz</a>
          </Link>

          <div className="flex space-x-4">
            <Link href="/quiz">
              <a className={`${location === '/quiz' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500`}>
                Take Quiz
              </a>
            </Link>
            <Link href="/forum">
              <a className={`${location === '/forum' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500`}>
                Community Forum
              </a>
            </Link>
            <Link href="/learning-paths">
              <a className={`${location === '/learning-paths' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500`}>
                Learning Paths
              </a>
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin">
                <a className={`${location === '/admin' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500`}>
                  Admin
                </a>
              </Link>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative">
              <User className="h-5 w-5" />
              <span className="ml-2">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}