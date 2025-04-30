
import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Award, TrendingUp, Star, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserEngagement {
  id: string;
  username: string;
  posts_count: number;
  likes_count: number;
  comments_count: number;
  avatar: string;
  engagement_score: number;
}

const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("engagement");
  const [users, setUsers] = useState<UserEngagement[]>([]);
  const { toast } = useToast();

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        // Get all users from profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username');

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
          setUsers([]);
          setIsLoading(false);
          return;
        }

        // Get engagement data for each user
        const usersWithEngagement = await Promise.all(
          profiles.map(async (profile) => {
            // Count user's posts
            const { count: postsCount } = await supabase
              .from('posts')
              .select('*', { count: 'exact' })
              .eq('user_id', profile.id);

            // Get all post IDs for this user
            const { data: userPosts } = await supabase
              .from('posts')
              .select('id')
              .eq('user_id', profile.id);

            const postIds = userPosts?.map(post => post.id) || [];

            let likesCount = 0;
            let commentsCount = 0;

            if (postIds.length > 0) {
              // Count likes on user's posts
              const { count: likes } = await supabase
                .from('likes')
                .select('*', { count: 'exact' })
                .in('post_id', postIds);

              // Count comments on user's posts
              const { count: comments } = await supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .in('post_id', postIds);

              likesCount = likes || 0;
              commentsCount = comments || 0;
            }

            // Calculate engagement score
            const engagementScore = (likesCount || 0) + (commentsCount || 0);

            return {
              id: profile.id,
              username: profile.username || 'Anonymous User',
              posts_count: postsCount || 0,
              likes_count: likesCount,
              comments_count: commentsCount,
              avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png', // Default avatar
              engagement_score: engagementScore
            };
          })
        );

        // Sort users based on the active tab
        const sortedUsers = sortUsers(usersWithEngagement, activeTab);
        setUsers(sortedUsers);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load leaderboard data',
          variant: 'destructive',
        });
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Sort users based on selected tab
  const sortUsers = (users: UserEngagement[], sortBy: string) => {
    const sortedUsers = [...users];
    
    switch (sortBy) {
      case "engagement":
        return sortedUsers.sort((a, b) => b.engagement_score - a.engagement_score);
      case "posts":
        return sortedUsers.sort((a, b) => b.posts_count - a.posts_count);
      case "likes":
        return sortedUsers.sort((a, b) => b.likes_count - a.likes_count);
      case "comments":
        return sortedUsers.sort((a, b) => b.comments_count - a.comments_count);
      default:
        return sortedUsers;
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setUsers(sortUsers(users, value));
  };

  return (
    <MainLayout>
      <div className="container mx-auto pb-20 md:pb-0">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Award size={24} className="text-amber-500" />
            <h1 className="text-2xl font-bold tamil">தரவரிசை</h1>
          </div>
          <p className="text-gray-600">
            இங்கு சிறந்த எழுத்தாளர்களின் தரவரிசையைக் காணலாம்.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Tabs defaultValue="engagement" value={activeTab} onValueChange={handleTabChange}>
            <div className="p-4 border-b border-gray-100">
              <TabsList className="grid grid-cols-4 bg-gray-100">
                <TabsTrigger value="engagement" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <div className="flex items-center gap-2">
                    <Star size={16} />
                    <span className="tamil">மொத்தம்</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span className="tamil">படைப்புகள்</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="likes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <div className="flex items-center gap-2">
                    <Star size={16} />
                    <span className="tamil">விருப்பங்கள்</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span className="tamil">கருத்துகள்</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="engagement" className="m-0">
              <LeaderboardContent users={users} isLoading={isLoading} sortType="engagement" />
            </TabsContent>
            <TabsContent value="posts" className="m-0">
              <LeaderboardContent users={users} isLoading={isLoading} sortType="posts" />
            </TabsContent>
            <TabsContent value="likes" className="m-0">
              <LeaderboardContent users={users} isLoading={isLoading} sortType="likes" />
            </TabsContent>
            <TabsContent value="comments" className="m-0">
              <LeaderboardContent users={users} isLoading={isLoading} sortType="comments" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

interface LeaderboardContentProps {
  users: UserEngagement[];
  isLoading: boolean;
  sortType: 'engagement' | 'posts' | 'likes' | 'comments';
}

const LeaderboardContent: React.FC<LeaderboardContentProps> = ({ users, isLoading, sortType }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">No users found with activity yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {users.map((user, index) => (
        <div key={user.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
          <div className={`font-bold text-lg w-6 text-center ${index < 3 ? 'text-amber-500' : 'text-gray-500'}`}>
            {index + 1}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="w-12 h-12 rounded-full border border-gray-200"
            />
            <div>
              <p className="font-medium tamil">{user.username}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{user.posts_count} படைப்புகள்</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{user.likes_count} விருப்பங்கள்</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{user.comments_count} கருத்துகள்</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">
              {sortType === 'engagement' && <span>{user.engagement_score}</span>}
              {sortType === 'posts' && <span>{user.posts_count}</span>}
              {sortType === 'likes' && <span>{user.likes_count}</span>}
              {sortType === 'comments' && <span>{user.comments_count}</span>}
            </div>
            <div className="text-xs text-gray-500 tamil">
              {sortType === 'engagement' && <span>மொத்த மதிப்பெண்</span>}
              {sortType === 'posts' && <span>படைப்புகள்</span>}
              {sortType === 'likes' && <span>விருப்பங்கள்</span>}
              {sortType === 'comments' && <span>கருத்துகள்</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
