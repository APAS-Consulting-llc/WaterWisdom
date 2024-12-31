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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white border-b px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button variant="ghost" className="p-0 hover:bg-transparent" asChild>
            <Link href="/">
              <Droplet className="w-6 h-6 mr-2 text-blue-500" />
              <span className="text-xl font-bold text-blue-500">One Water Hub</span>
            </Link>
          </Button>

          <div className="flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant="ghost"
                className={`flex items-center gap-1.5 ${
                  location === path ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500'
                }`}
                asChild
              >
                <Link href={path}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative">
              <User className="h-5 w-5" />
              <span className="ml-2">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}