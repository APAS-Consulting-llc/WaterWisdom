import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Droplet, BookOpen, MessageSquare, Users, Brain, Bot } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useUser();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = [
    { path: '/quiz', label: 'Take Quiz', icon: BookOpen },
    { path: '/knowledge', label: 'Expert Knowledge', icon: Brain },
    { path: '/forum', label: 'Community Forum', icon: Users },
    { path: '/learning-paths', label: 'Learning Paths', icon: MessageSquare },
    { path: '/chat', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <nav className="w-full bg-white border-b px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <a className="flex items-center text-xl font-bold text-blue-500">
              <Droplet className="w-6 h-6 mr-2" />
              WaterWisdom
            </a>
          </Link>

          <div className="flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <a className={`
                  flex items-center gap-1.5
                  ${location === path ? 'text-blue-500' : 'text-gray-600'} 
                  hover:text-blue-500 cursor-pointer transition-colors
                `}>
                  <Icon className="w-4 h-4" />
                  {label}
                </a>
              </Link>
            ))}
            {user.role === 'admin' && (
              <Link href="/admin">
                <a className={`${location === '/admin' ? 'text-blue-500' : 'text-gray-600'} hover:text-blue-500 cursor-pointer`}>
                  Admin
                </a>
              </Link>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative">
              <User className="h-5 w-5" />
              <span className="ml-2">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/profile">
              <a className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </a>
            </Link>
            <Link href="/settings">
              <a className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </a>
            </Link>
            <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}