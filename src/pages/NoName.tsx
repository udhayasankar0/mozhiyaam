
import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/layouts/MainLayout';
import ContentCard from '@/components/ContentCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

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

const NoName = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  const fetchContents = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching content for NoName page...');
      
      // Get all posts of type "poem"
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('type', 'poem')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!posts || posts.length === 0) {
        setContents([]);
        return;
      }

      // For each post, get essential data
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Get author info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', post.user_id)
            .single();

          // Get likes count
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact' })
            .eq('post_id', post.id);

          // Get comments count
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact' })
            .eq('post_id', post.id);

          // Check if current user has liked or disliked
          let userLiked = false;
          let userDisliked = false;

          if (user) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('*')
              .eq('post_id', post.id)
              .eq('user_id', user.id);

            const { data: dislikeData } = await supabase
              .from('dislikes')
              .select('*')
              .eq('post_id', post.id)
              .eq('user_id', user.id);

            userLiked = likeData && likeData.length > 0;
            userDisliked = dislikeData && dislikeData.length > 0;
          }

          return {
            ...post,
            type: post.type as 'poem' | 'story' | 'opinion',
            author_name: profileData?.username || 'Unknown Author',
            author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png', // Default avatar
            likes: likesCount || 0,
            comments: commentsCount || 0,
            userLiked,
            userDisliked
          };
        })
      );

      setContents(postsWithDetails);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents, location.key]); // Add location.key to refetch when navigating back to this page

  return (
    <MainLayout onRefresh={fetchContents}>
      <div className="container mx-auto pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 tamil">படைப்புகள்</h1>
          <p className="text-gray-600">
            Discover the most beautiful Tamil poems from our community.
          </p>
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
        ) : contents.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium mb-2">No poems yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share your beautiful Tamil poetry!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {contents.map((content) => (
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
                onUpdate={fetchContents}
                // No truncateLines prop means show full content
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NoName;
