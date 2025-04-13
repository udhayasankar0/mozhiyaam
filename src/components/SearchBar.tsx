
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'post' | 'user';
  title?: string;
  content?: string;
  username?: string;
  postType?: 'poem' | 'story' | 'opinion';
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside of the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search function with debouncing
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Search posts by title
        const { data: postResults, error: postError } = await supabase
          .from('posts')
          .select('id, title, content, type')
          .ilike('title', `%${query}%`)
          .limit(5);

        if (postError) throw postError;

        // Search users by username
        const { data: userResults, error: userError } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', `%${query}%`)
          .limit(5);

        if (userError) throw userError;

        // Combine and format results
        const formattedResults: SearchResult[] = [
          ...(postResults?.map(post => ({
            id: post.id,
            type: 'post' as const,
            title: post.title,
            content: post.content,
            postType: post.type as 'poem' | 'story' | 'opinion'
          })) || []),
          ...(userResults?.map(user => ({
            id: user.id,
            type: 'user' as const,
            username: user.username
          })) || [])
        ];

        setResults(formattedResults);
        setShowResults(true);
      } catch (error: any) {
        toast({
          title: 'Search Error',
          description: error.message || 'Failed to search',
          variant: 'destructive',
        });
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);  // 300ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    
    if (result.type === 'post') {
      navigate(`/content/${result.id}`);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  const renderResultIcon = (result: SearchResult) => {
    if (result.type === 'user') {
      return <User size={16} />;
    } else {
      return <BookOpen size={16} />;
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, username..."
          className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={16} className="text-muted-foreground" />
          )}
        </div>
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Search results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <div 
              key={`${result.type}-${result.id}`} 
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center gap-2">
                {renderResultIcon(result)}
                <div>
                  {result.type === 'post' ? (
                    <>
                      <p className="font-medium line-clamp-1">{result.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{result.content}</p>
                    </>
                  ) : (
                    <p className="font-medium">{result.username || 'Anonymous User'}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-center">
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchBar;
