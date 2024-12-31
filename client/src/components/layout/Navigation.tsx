import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Droplet } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useUser();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <nav className="w-full bg-white border-b px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <span className="flex items-center text-xl font-bold text-blue-500">
              <Droplet className="w-6 h-6 mr-2" />
              WaterQuiz
            </span>
          </Link>

          <div className="flex space-x-4">
            <Link href="/quiz">
              <span className={`${location === '/quiz' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500 cursor-pointer`}>
                Take Quiz
              </span>
            </Link>
            <Link href="/forum">
              <span className={`${location === '/forum' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500 cursor-pointer`}>
                Community Forum
              </span>
            </Link>
            <Link href="/learning-paths">
              <span className={`${location === '/learning-paths' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500 cursor-pointer`}>
                Learning Paths
              </span>
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin">
                <span className={`${location === '/admin' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500 cursor-pointer`}>
                  Admin
                </span>
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
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}