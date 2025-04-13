
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FollowButton from './FollowButton';
import { useToast } from '@/hooks/use-toast';

interface FollowUserType {
  id: string;
  username: string | null;
  avatar_url?: string;
}

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

const FollowList: React.FC<FollowListProps> = ({ userId, type }) => {
  const [users, setUsers] = useState<FollowUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching ${type} for user ID: ${userId}`);
        
        if (type === 'followers') {
          // Get users who follow the specified user
          const { data, error } = await supabase
            .from('followers')
            .select(`
              follower_id,
              profiles!followers_follower_id_fkey(
                id,
                username
              )
            `)
            .eq('following_id', userId);
            
          if (error) {
            console.error(`Error fetching ${type}:`, error);
            setError(error.message);
            toast({
              title: "Error",
              description: `Failed to load ${type}: ${error.message}`,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          console.log(`Raw followers data:`, data);
          
          // Format the user data
          if (data && data.length > 0) {
            const formattedUsers: FollowUserType[] = data
              .filter((item: any) => item.profiles) // Filter out null profiles
              .map((item: any) => {
                const profile = item.profiles;
                return {
                  id: profile.id,
                  username: profile.username || 'Anonymous User',
                  avatar_url: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png' // Default avatar
                };
              });
            
            console.log('Formatted followers:', formattedUsers);
            setUsers(formattedUsers);
          } else {
            console.log('No followers found');
            setUsers([]);
          }
        } else {
          // Get users who are followed by the specified user
          const { data, error } = await supabase
            .from('followers')
            .select(`
              following_id,
              profiles!followers_following_id_fkey(
                id,
                username
              )
            `)
            .eq('follower_id', userId);
            
          if (error) {
            console.error(`Error fetching ${type}:`, error);
            setError(error.message);
            toast({
              title: "Error",
              description: `Failed to load ${type}: ${error.message}`,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          console.log(`Raw following data:`, data);
          
          // Format the user data
          if (data && data.length > 0) {
            const formattedUsers: FollowUserType[] = data
              .filter((item: any) => item.profiles) // Filter out null profiles
              .map((item: any) => {
                const profile = item.profiles;
                return {
                  id: profile.id,
                  username: profile.username || 'Anonymous User',
                  avatar_url: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png' // Default avatar
                };
              });
            
            console.log('Formatted following:', formattedUsers);
            setUsers(formattedUsers);
          } else {
            console.log('No following found');
            setUsers([]);
          }
        }
      } catch (error: any) {
        console.error(`Error in fetchUsers for ${type}:`, error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Something went wrong: ${error.message}`,
          variant: "destructive",
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUsers();
    } else {
      console.log('No userId provided to FollowList');
      setLoading(false);
    }
  }, [userId, type, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-500 font-medium">Error loading data</p>
        <p className="text-sm text-red-400 mt-2">{error}</p>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-500 font-medium">
          {type === 'followers' 
            ? 'No followers yet' 
            : 'You are not following anyone yet'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {type === 'followers'
            ? 'When someone follows you, they will appear here.'
            : 'When you follow someone, they will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-gray-100">
          <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} alt={user.username || 'User'} />
              <AvatarFallback>
                {(user.username || 'User').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.username || 'Anonymous User'}</p>
            </div>
          </Link>
          <FollowButton userId={user.id} />
        </div>
      ))}
    </div>
  );
};

export default FollowList;
