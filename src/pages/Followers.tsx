
import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowList from '@/components/FollowList';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';

const Followers = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('followers');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a brief delay to allow auth state to resolve
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-full mb-6"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10">
          <div className="text-center p-8 bg-white shadow-sm rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-gray-600">You need to be signed in to view your followers.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  console.log('Followers page - Current user ID:', user.id);

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold tamil">பின்தொடர்பவர்கள்</h1>
        </div>
        
        <Card className="p-6 shadow-md border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="followers" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Users className="h-4 w-4" />
                Followers
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <UserPlus className="h-4 w-4" />
                Following
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="followers" className="mt-4">
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-semibold mb-4">People Following You</h2>
                {user && user.id && (
                  <FollowList userId={user.id} type="followers" />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="following" className="mt-4">
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-semibold mb-4">People You Follow</h2>
                {user && user.id && (
                  <FollowList userId={user.id} type="following" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Followers;
