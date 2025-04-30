import React, { useState } from 'react';
import { Menu, Search, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onRefresh }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  // Generate initials from email or use default
  const getInitials = () => {
    if (!user || !user.email) return '??';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card px-4 py-3 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="btn-ghost p-2 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Link to="/">
            <h1 className="text-xl font-semibold">
              <span className="tamil">மொழியாம்</span>
              <span className="sr-only">Tamil Library</span>
            </h1>
          </Link>
        </div>
      </div>

      <div className="hidden md:flex items-center flex-1 mx-6">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="md:hidden">
          {searchOpen ? (
            <div className="absolute inset-x-0 top-0 h-full bg-background px-4 py-3 flex items-center animate-fade-in">
              <SearchBar />
              <button 
                onClick={() => setSearchOpen(false)}
                className="ml-2 p-2"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSearchOpen(true)}
              className="btn-ghost p-2"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png" alt="Profile" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-500">
                <LogOut size={16} />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
