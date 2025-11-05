import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Users, Clock, Star, Trash2, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Space {
  id: string;
  title: string;
  description: string;
  location: string;
  capacity: number;
  price: number;
  type: string;
  image: string;
  rating: number;
  available: boolean;
  hostId: string;
}

interface SpaceCardProps {
  space: Space;
  isHost?: boolean;
  currentUserId?: string;
  onDelete?: (spaceId: string) => void;
  onView?: (spaceId: string) => void;
  showLoginPrompt?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (spaceId: string) => void;
}

export const SpaceCard = React.memo(function SpaceCard({ 
  space, 
  isHost, 
  currentUserId, 
  onDelete, 
  onView, 
  showLoginPrompt, 
  isFavorited = false, 
  onToggleFavorite 
}: SpaceCardProps) {
  const isOwner = isHost && currentUserId === space.hostId;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <ImageWithFallback
          src={space.image}
          alt={space.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={space.available ? "default" : "secondary"}>
            {space.available ? "예약 가능" : "예약 불가"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="outline" className="bg-white/90">
            {space.type}
          </Badge>
          {!isOwner && (
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 bg-white/90 hover:bg-white"
              onClick={() => onToggleFavorite?.(space.id)}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-1">{space.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{space.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{space.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{space.capacity}명</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{space.rating}</span>
            </div>
            <div className="text-lg font-semibold">
              {space.price.toLocaleString()}원<span className="text-sm font-normal">/시간</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        {isOwner ? (
          <>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onView?.(space.id)}
            >
              수정
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => onDelete?.(space.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="w-full space-y-2">
            <Button 
              className="w-full" 
              disabled={!space.available}
              onClick={() => onView?.(space.id)}
            >
              {showLoginPrompt ? "상세보기" : (space.available ? "예약하기" : "예약 불가")}
            </Button>
            {showLoginPrompt && space.available && (
              <p className="text-xs text-center text-muted-foreground">
                예약하려면 로그인이 필요합니다
              </p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
});