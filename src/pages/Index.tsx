
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ContentCard from '@/components/ContentCard';
import { Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Content {
  id: string;
  type: 'poem' | 'story' | 'opinion';
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
  likes: number;
  comments: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const fetchPosts = useCallback(async () => {
    try {
      console.log('Fetching posts...', { 
        activeCategory, 
        user: user?.id || 'No user logged in' 
      });
      setIsLoading(true);
      
      // Step 1: Fetch posts without the profiles join that's causing the error
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeCategory !== 'all') {
        query = query.eq('type', activeCategory);
      }

      const { data: posts, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Raw posts fetched:', posts?.length || 0);

      if (!posts || posts.length === 0) {
        setContents([]);
        setIsLoading(false);
        return;
      }

      // Step 2: Process the posts and fetch author usernames in a separate query
      const processedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            // Fetch author username for this post
            const { data: authorData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', post.user_id)
              .single();

            const { count: likesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact' })
              .eq('post_id', post.id);

            const { count: commentsCount } = await supabase
              .from('comments')
              .select('*', { count: 'exact' })
              .eq('post_id', post.id);

            // Check if current user has liked or disliked the post
            let userLiked = false;
            let userDisliked = false;
            
            if (user) {
              const { data: likeData } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', user.id);
                
              userLiked = likeData && likeData.length > 0;
              
              const { data: dislikeData } = await supabase
                .from('dislikes')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', user.id);
                
              userDisliked = dislikeData && dislikeData.length > 0;
            }

            console.log(`Processing post ${post.id}:`, {
              likesCount, 
              commentsCount,
              authorUsername: authorData?.username || 'Unknown',
              userLiked,
              userDisliked
            });

            return {
              ...post,
              type: post.type as 'poem' | 'story' | 'opinion',
              author_name: authorData?.username || 'Unknown Author',
              author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png',
              likes: likesCount || 0,
              comments: commentsCount || 0,
              userLiked,
              userDisliked
            };
          } catch (processingError) {
            console.error(`Error processing post ${post.id}:`, processingError);
            return null;
          }
        })
      );

      const validPosts = processedPosts.filter(post => post !== null) as Content[];

      console.log('Processed posts:', validPosts.length);
      setContents(validPosts);
    } catch (error: any) {
      console.error('Comprehensive fetch posts error:', error);
      toast({
        title: 'Error Fetching Posts',
        description: error.message || 'Failed to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeCategory, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, location.key]);

  const filteredContents = searchTerm 
    ? contents.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : contents;

  const handleNoNameClick = () => {
    navigate('/noname');
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <MainLayout onRefresh={fetchPosts} onCategoryChange={handleCategoryChange}>
      <div className="container mx-auto pb-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome to <span className="tamil">மொழியாம்</span></h2>
              <p className="text-gray-600">Explore content from our community</p>
            </div>
            <Button 
              onClick={handleNoNameClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Star className="mr-2 h-4 w-4" />
              <span className="tamil">படைப்புகள்</span>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by title or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="content-card bg-white rounded-xl overflow-hidden shadow-md animate-pulse-soft border border-gray-100 h-[600px]">
                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-[480px] bg-gray-100 rounded mb-4 flex-grow"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium mb-2">
              {searchTerm ? 'No matching posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try a different search term or check back later.'
                : 'Be the first to create a post!'}
            </p>
            {user ? (
              <p>Click the "புதிய படைப்பு" button to create your first post.</p>
            ) : (
              <p>Sign in to create a post and get started!</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredContents.map((content) => (
              <ContentCard
                key={content.id}
                id={content.id}
                type={content.type}
                title={content.title}
                excerpt={content.content}
                authorId={content.user_id}
                authorName={content.author_name || 'Unknown Author'}
                authorAvatar={content.author_avatar || '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png'}
                likes={content.likes}
                comments={content.comments}
                date={new Date(content.created_at).toLocaleDateString()}
                userLiked={content.userLiked || false}
                userDisliked={content.userDisliked || false}
                onUpdate={fetchPosts}
                truncateLines={3} // Set truncation to 3 lines
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
