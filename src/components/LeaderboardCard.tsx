
import React from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardCardProps {
  rank: number;
  name: string;
  followers: number;
  works: number;
  avatar: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  name,
  followers,
  works,
  avatar
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="font-bold text-lg w-6 text-center">
        {rank}
      </div>
      <Link to={`/profile/${name}`} className="flex-1 flex items-center gap-2">
        <img 
          src={avatar} 
          alt={name} 
          className="w-10 h-10 rounded-full border border-gray-200"
        />
        <div>
          <p className="text-sm font-medium tamil">{name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{followers} பின்தொடர்பவர்கள்</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{works} படைப்புகள்</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LeaderboardCard;
