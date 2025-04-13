import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Book, 
  BookOpen, 
  MessageSquare as Opinion, 
  ChevronUp, 
  ChevronDown,
  Loader2 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface ContentCardProps {
  id: string;
  type: 'poem' | 'story' | 'opinion';
  title: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  date: string;
  userLiked: boolean;
  userDisliked: boolean;
  onUpdate: () => void;
  truncateLines?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  type,
  title,
  excerpt,
  authorId,
  authorName,
  authorAvatar,
  likes: initialLikes,
  comments: initialComments,
  date,
  userLiked: initialUserLiked,
  userDisliked: initialUserDisliked,
  onUpdate,
  truncateLines
}) => {
  const [liked, setLiked] = useState(initialUserLiked);
  const [disliked, setDisliked] = useState(initialUserDisliked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getTypeIcon = () => {
    switch (type) {
      case 'poem':
        return <Book size={16} className="text-blue-500" />;
      case 'story':
        return <BookOpen size={16} className="text-emerald-500" />;
      case 'opinion':
        return <Opinion size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case 'poem':
        return 'கவிதை';
      case 'story':
        return 'சிறுகதை';
      case 'opinion':
        return 'கருத்து';
      default:
        return '';
    }
  };

  const formatContent = () => {
    if (!truncateLines || showFullText) {
      return (
        <p className="text-sm text-gray-600 mb-1 tamil">
          {excerpt.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      );
    } else {
      const lines = excerpt.split('\n').slice(0, truncateLines);
      const hasMoreLines = excerpt.split('\n').length > truncateLines;
      
      return (
        <>
          <p className="text-sm text-gray-600 mb-1 tamil">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
            {hasMoreLines && '...'}
          </p>
          {hasMoreLines && (
            <Button 
              variant="link" 
              onClick={() => setShowFullText(true)} 
              className="p-0 h-auto text-sm text-primary mt-1 hover:bg-gray-50"
            >
              <span className="tamil">முழுவதையும் படிக்க</span>
            </Button>
          )}
        </>
      );
    }
  };

  const fetchComments = async () => {
    if (!showComments) return;
    
    try {
      setIsLoadingComments(true);
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!commentsData) {
        setCommentsList([]);
        return;
      }
      
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
            author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png',
          };
        })
      );
      
      setCommentsList(commentsWithAuthor);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  React.useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleLike = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', id);
        setLikesCount(likesCount - 1);
        setLiked(false);
      } else {
        if (disliked) {
          await supabase
            .from('dislikes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', id);
          setDisliked(false);
        }
        
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: id });
        setLikesCount(likesCount + 1);
        setLiked(true);
      }
      
      onUpdate();
      
      toast({
        title: liked ? 'Unliked' : 'Liked',
        description: liked ? 'You have unliked this post' : 'You have liked this post',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive'
      });
      console.error('Like error:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (disliked) {
        await supabase
          .from('dislikes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', id);
        setDisliked(false);
        
        toast({
          title: 'Removed Dislike',
          description: 'You have removed your dislike from this post',
        });
      } else {
        if (liked) {
          await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', id);
          setLiked(false);
          setLikesCount(likesCount - 1);
        }
        
        await supabase
          .from('dislikes')
          .insert({ user_id: user.id, post_id: id });
        setDisliked(true);
        
        toast({
          title: 'Disliked',
          description: 'You have disliked this post',
        });
      }
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update dislike status',
        variant: 'destructive'
      });
      console.error('Dislike error:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setIsPostingComment(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: id,
          user_id: user.id
        });
        
      if (error) throw error;
      
      setCommentsCount(count => count + 1);
      setNewComment('');
      
      fetchComments();
      
      onUpdate();
      
      toast({
        title: 'Success',
        description: 'Your comment has been posted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive'
      });
      console.error('Comment error:', error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <Link to={`/profile/${authorId}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{authorName}</p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
            {getTypeIcon()}
            <span className="text-xs font-medium tamil">{getTypeLabel()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2 px-4">
        <h3 className="text-lg font-semibold mb-2 tamil hover:text-primary transition-colors">
          <Link to={`/content/${id}`}>{title}</Link>
        </h3>
        <div className="min-h-[50px]">
          {formatContent()}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <ThumbsUp size={18} className={liked ? "fill-current" : ""} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          <button 
            className={`flex items-center gap-1.5 transition-colors ${disliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
            onClick={handleDislike}
            aria-label={disliked ? "Remove dislike" : "Dislike"}
          >
            <ThumbsDown size={18} className={disliked ? "fill-current" : ""} />
          </button>
        </div>
        <button
          className={`flex items-center gap-1.5 transition-colors ${showComments ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={handleToggleComments}
          aria-label={showComments ? "Hide comments" : "Show comments"}
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">{commentsCount}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </CardFooter>

      {showComments && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Comments</h4>
          
          {user && (
            <div className="flex flex-col gap-2 mb-4">
              <Textarea 
                placeholder="Add your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-white"
                disabled={isPostingComment}
              />
              <Button 
                onClick={handleCommentSubmit} 
                disabled={!newComment.trim() || isPostingComment}
                className="self-end"
              >
                {isPostingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="py-4 text-center flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                <span>Loading comments...</span>
              </div>
            ) : commentsList.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No comments yet. Be the first to comment!</div>
            ) : (
              commentsList.map((comment) => (
                <div key={comment.id} className="border-b pb-4 bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                      <AvatarFallback>{comment.author_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ContentCard;
