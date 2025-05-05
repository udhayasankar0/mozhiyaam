
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
 
interface FollowUserType {
  id: string;
  username: string | null;
  avatar_url?: string;
}

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

const FollowList: React.FC<FollowListProps> = ({ type }) => {
  const [users, setUsers] = useState<FollowUserType[]>([]);


  const hardcodedFollowers = [
    { id: 'unknown1', username: 'Unknown User', avatar_url: '/profile.png' },
    { id: 'udhay', username: 'udhay', avatar_url: '/profile.png' },
    { id: 'muthupandi', username: 'Muthupandi M', avatar_url: '/profile.png' },
    { id: 'ram', username: 'Ram', avatar_url: '/profile.png' },
    { id: 'prabhakaran', username: 'Prabhakaran', avatar_url: '/profile.png' },
  ];

  const hardcodedFollowing = [
    { id: 'prabhakaran', username: 'Prabhakaran', avatar_url: '/profile.png' },
    { id: 'ram', username: 'Ram', avatar_url: '/profile.png' },
    { id: 'udhay', username: 'udhay', avatar_url: '/profile.png' },
    { id: 'muthupandi', username: 'Muthupandi M', avatar_url: '/profile.png' },
  ];


  useEffect(() => {    
    if (type === 'followers') {
      setUsers(hardcodedFollowers);
      return;
    }
    if (type === 'following') {
      setUsers(hardcodedFollowing);
      return;
    }
  }, [type]);



  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-100 pb-[30px]">
          <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} alt={user.username || 'User'} />
               <AvatarFallback>{(user.username || 'User').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
            <p className="font-medium">{user.username || 'Anonymous User'}</p>
            </div>
            
            
          </Link>
        </div>
      ))}
    </div>
  );
};

export default FollowList;
