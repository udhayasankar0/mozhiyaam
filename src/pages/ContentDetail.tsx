
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface Content {
  id: string;
  title: string;
  content: string;
  type: 'poem' | 'story' | 'opinion';
  user_id: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

const ContentDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch content details
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Get post details
        const { data: post, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!post) {
          toast({
            title: 'Not Found',
            description: 'The requested content could not be found.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        // Get author details
        const { data: authorData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', post.user_id)
          .single();

        // Get likes
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact' })
          .eq('post_id', post.id);

        // Check if user has liked or disliked
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

          setIsLiked(likeData && likeData.length > 0);
          setIsDisliked(dislikeData && dislikeData.length > 0);
        }

        // Set content with author info
        setContent({
          ...post,
          type: post.type as 'poem' | 'story' | 'opinion',
          author_name: authorData?.username || 'Unknown Author',
          author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png', // Default avatar
        });
        
        setLikes(likesCount || 0);
        
        // Fetch comments
        fetchComments(post.id);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load content',
          variant: 'destructive',
        });
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id, user]);

  // Fetch comments for this post
  const fetchComments = async (postId: string) => {
    try {
      // Get comments
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!commentsData) {
        setComments([]);
        return;
      }

      // Get author info for each comment
      const commentsWithAuthor = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            author_name: authorData?.username || 'Unknown User',
            author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png', // Default avatar
          };
        })
      );

      setComments(commentsWithAuthor);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load comments',
        variant: 'destructive',
      });
      console.error('Error fetching comments:', error);
    }
  };

  // Handle like/dislike
  const handleLikeToggle = async () => {
    if (!user || !content) {
      navigate('/auth');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', content.id);
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        // If disliked, remove dislike first
        if (isDisliked) {
          await supabase
            .from('dislikes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', content.id);
          setIsDisliked(false);
        }
        
        // Add like
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: content.id });
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like status',
        variant: 'destructive',
      });
      console.error('Like error:', error);
    }
  };

  // Handle dislike toggle
  const handleDislikeToggle = async () => {
    if (!user || !content) {
      navigate('/auth');
      return;
    }

    try {
      if (isDisliked) {
        // Remove dislike
        await supabase
          .from('dislikes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', content.id);
        setIsDisliked(false);
      } else {
        // If liked, remove like first
        if (isLiked) {
          await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', content.id);
          setIsLiked(false);
          setLikes(likes - 1);
        }
        
        // Add dislike
        await supabase
          .from('dislikes')
          .insert({ user_id: user.id, post_id: content.id });
        setIsDisliked(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update dislike status',
        variant: 'destructive',
      });
      console.error('Dislike error:', error);
    }
  };

  // Post new comment
  const handleCommentSubmit = async () => {
    if (!user || !content) {
      navigate('/auth');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setIsCommentLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: content.id,
          user_id: user.id
        });
        
      if (error) throw error;
      
      // Clear input and refresh comments
      setNewComment('');
      fetchComments(content.id);
      
      toast({
        title: 'Success',
        description: 'Your comment has been posted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment',
        variant: 'destructive',
      });
      console.error('Comment error:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Format post type
  const formatPostType = (type: string) => {
    switch (type) {
      case 'poem':
        return 'கவிதை';
      case 'story':
        return 'சிறுகதை';
      case 'opinion':
        return 'கருத்து';
      default:
        return type;
    }
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!content) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Content not found</h2>
          <p className="mb-4">The content you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 flex items-center gap-1"
          onClick={handleGoBack}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        
        <Card className="overflow-hidden shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={content.author_avatar} alt={content.author_name} />
                <AvatarFallback>{content.author_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{content.author_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(content.created_at).toLocaleDateString()} • {formatPostType(content.type)}
                </p>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-4 tamil">{content.title}</h1>
          </CardHeader>
          
          <CardContent className="prose max-w-none">
            <div className="tamil">
              {content.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex items-center justify-between border-t py-4">
            <div className="flex items-center gap-4">
              <button 
                className={`flex items-center gap-2 ${isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                onClick={handleLikeToggle}
              >
                <ThumbsUp size={20} className={isLiked ? "fill-current" : ""} />
                <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <button 
                className={`flex items-center gap-2 ${isDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                onClick={handleDislikeToggle}
              >
                <ThumbsDown size={20} className={isDisliked ? "fill-current" : ""} />
                <span>Dislike</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500">
              <MessageSquare size={20} />
              <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
            </div>
          </CardFooter>
        </Card>
        
        {/* Comments section */}
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-xl font-bold">Comments</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isCommentLoading}
                />
                <Button 
                  onClick={handleCommentSubmit} 
                  disabled={!newComment.trim() || isCommentLoading}
                >
                  {isCommentLoading ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 border-b pb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                      <AvatarFallback>{comment.author_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">{comment.author_name}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContentDetail;
