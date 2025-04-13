
import React, { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Award, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import LeaderboardCard from '@/components/LeaderboardCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interface for content
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
  totalEngagement: number;
}

// Interface for top writers
interface Writer {
  id: string;
  name: string;
  followers: number;
  works: number;
  avatar: string;
}

const WritersSpotlight = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [topWriters, setTopWriters] = useState<Writer[]>([]);
  const [poemOfTheDay, setPoemOfTheDay] = useState<Content | null>(null);
  const [storyOfTheDay, setStoryOfTheDay] = useState<Content | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch top writers based on engagement
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username');

        if (profilesError) throw profilesError;

        if (profiles && profiles.length > 0) {
          const writersWithStats = await Promise.all(
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

              if (postIds.length > 0) {
                // Count likes on user's posts
                const { count: likes } = await supabase
                  .from('likes')
                  .select('*', { count: 'exact' })
                  .in('post_id', postIds);

                likesCount = likes || 0;
              }

              return {
                id: profile.id,
                name: profile.username || 'Unknown User',
                followers: likesCount, // Using likes as followers for now
                works: postsCount || 0,
                avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png'
              };
            })
          );

          // Sort writers by followers (likes)
          const sortedWriters = writersWithStats.sort((a, b) => b.followers - a.followers);
          setTopWriters(sortedWriters.slice(0, 6)); // Top 6 writers
        }

        // Fetch poem of the day (top poem by engagement)
        const { data: poems, error: poemsError } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'poem');

        if (poemsError) throw poemsError;

        if (poems && poems.length > 0) {
          const poemsWithEngagement = await Promise.all(
            poems.map(async (poem) => {
              // Get likes count
              const { count: likesCount } = await supabase
                .from('likes')
                .select('*', { count: 'exact' })
                .eq('post_id', poem.id);

              // Get comments count
              const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('post_id', poem.id);

              // Get author info
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', poem.user_id)
                .single();

              const totalEngagement = (likesCount || 0) + (commentsCount || 0);

              return {
                ...poem,
                type: poem.type as 'poem' | 'story' | 'opinion',
                author_name: profileData?.username || 'Unknown Author',
                author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png',
                likes: likesCount || 0,
                comments: commentsCount || 0,
                totalEngagement
              };
            })
          );

          // Sort poems by total engagement
          const sortedPoems = poemsWithEngagement.sort((a, b) => b.totalEngagement - a.totalEngagement);
          if (sortedPoems.length > 0) {
            setPoemOfTheDay(sortedPoems[0]);
          }
        }

        // Fetch story of the day (top story by engagement)
        const { data: stories, error: storiesError } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'story');

        if (storiesError) throw storiesError;

        if (stories && stories.length > 0) {
          const storiesWithEngagement = await Promise.all(
            stories.map(async (story) => {
              // Get likes count
              const { count: likesCount } = await supabase
                .from('likes')
                .select('*', { count: 'exact' })
                .eq('post_id', story.id);

              // Get comments count
              const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('post_id', story.id);

              // Get author info
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', story.user_id)
                .single();

              const totalEngagement = (likesCount || 0) + (commentsCount || 0);

              return {
                ...story,
                type: story.type as 'poem' | 'story' | 'opinion',
                author_name: profileData?.username || 'Unknown Author',
                author_avatar: '/lovable-uploads/d8ec8cb6-fb3f-4663-bffd-f8c7748b84c9.png',
                likes: likesCount || 0,
                comments: commentsCount || 0,
                totalEngagement
              };
            })
          );

          // Sort stories by total engagement
          const sortedStories = storiesWithEngagement.sort((a, b) => b.totalEngagement - a.totalEngagement);
          if (sortedStories.length > 0) {
            setStoryOfTheDay(sortedStories[0]);
          }
        }

      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load spotlight data',
          variant: 'destructive',
        });
        console.error('Error fetching spotlight data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto pb-20 md:pb-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <Award size={24} className="text-amber-500" />
            <span className="tamil">சிறந்த எழுத்தாளர்கள்</span>
          </h2>
          <p className="text-gray-600">Today's top Tamil writers based on followers and engagement</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Leaderboard Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 tamil">சிறந்த எழுத்தாளர்கள்</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="font-bold text-lg w-6 text-center text-gray-200">
                      {i + 1}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topWriters.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No writers found yet. Be the first to contribute!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topWriters.map((writer, index) => (
                  <LeaderboardCard
                    key={writer.id}
                    rank={index + 1}
                    name={writer.name}
                    followers={writer.followers}
                    works={writer.works}
                    avatar={writer.avatar}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Featured Content Section */}
          <div className="space-y-6">
            {/* Poem of the Day */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bookmark size={20} className="text-blue-500" />
                  <span className="tamil">கவிதை OF THE DAY</span>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : !poemOfTheDay ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No poems found yet. Be the first to contribute!</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={poemOfTheDay.author_avatar} alt={poemOfTheDay.author_name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <span className="text-sm font-medium">{poemOfTheDay.author_name}</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 tamil">{poemOfTheDay.title}</h4>
                  <p className="text-gray-700 mb-4 tamil line-clamp-4">
                    {poemOfTheDay.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{poemOfTheDay.likes} likes</span>
                      <span>{poemOfTheDay.comments} comments</span>
                    </div>
                    <Link to={`/content/${poemOfTheDay.id}`} className="text-green-600 text-sm font-medium hover:underline">
                      <span className="tamil">முழுவதையும் படிக்க</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Story of the Day */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bookmark size={20} className="text-green-500" />
                  <span className="tamil">சிறுகதை OF THE DAY</span>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : !storyOfTheDay ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No stories found yet. Be the first to contribute!</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={storyOfTheDay.author_avatar} alt={storyOfTheDay.author_name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <span className="text-sm font-medium">{storyOfTheDay.author_name}</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 tamil">{storyOfTheDay.title}</h4>
                  <p className="text-gray-700 mb-4 tamil line-clamp-4">
                    {storyOfTheDay.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{storyOfTheDay.likes} likes</span>
                      <span>{storyOfTheDay.comments} comments</span>
                    </div>
                    <Link to={`/content/${storyOfTheDay.id}`} className="text-green-600 text-sm font-medium hover:underline">
                      <span className="tamil">முழுவதையும் படிக்க</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WritersSpotlight;
