
import React, { useState, useEffect } from 'react';
import { Book, BookOpen, MessageSquare, List, PenSquare, Award, User, Home, UsersRound, GamepadIcon } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onCategoryChange?: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const location = useLocation();
  const navigate = useNavigate();
  
  const categories = [
    { id: 'all', name: 'அனைத்தும்', englishName: 'All', icon: List },
    { id: 'poem', name: 'கவிதைகள்', englishName: 'Poems', icon: Book },
    { id: 'story', name: 'சிறுகதைகள்', englishName: 'Short Stories', icon: BookOpen },
    { id: 'opinion', name: 'கருத்துக்கள்', englishName: 'Opinions', icon: MessageSquare },
  ];
  
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Call the callback if it exists
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };
  
  return (
    <aside 
      className={`fixed md:sticky top-0 left-0 z-40 h-full md:h-[calc(100vh-4rem)] w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 overflow-hidden border-r border-gray-200`}
    >
      <ScrollArea className="h-full py-6 px-3">
        <div className="space-y-1 mb-6">
          <Link to="/" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
            <Home size={18} />
            <span className="tamil">முகப்பு</span>
          </Link>
          <Link to="/noname" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/noname' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
            <UsersRound size={18} />
            <span className="tamil">படைப்புகள்</span>
          </Link>
          <Link to="/spotlight" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/spotlight' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
            <Award size={18} />
            <span className="tamil">சிறந்த எழுத்தாளர்கள்</span>
          </Link>
          <Link to="/games" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/games' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
            <GamepadIcon size={18} />
            <span className="tamil">விளையாட்டு</span>
          </Link>
        </div>
        
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 px-4 mb-2">Categories</h2>
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        
        <div className="px-3 mb-6">
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link to="/editor" className="flex items-center justify-center gap-2">
              <PenSquare size={16} />
              <span className="tamil">புதிய படைப்பு</span>
            </Link>
          </Button>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">உங்கள் கணக்கு</h3>
            <div className="space-y-2">
              <Link to="/profile" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/profile' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                <User size={18} />
                <span className="tamil">சுயவிவரம்</span>
              </Link>
              <Link to="/followers" className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.pathname === '/followers' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                <MessageSquare size={18} />
                <span className="tamil">பின்தொடர்பவர்கள்</span>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
