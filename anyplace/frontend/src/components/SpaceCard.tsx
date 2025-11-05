import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Users, Star, Trash2, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// (추가) spaceService.ts가 사용하는 공통 타입을 임포트합니다.
import { Space } from '../lib/types';

// (삭제) 컴포넌트 내부의 'interface Space'는 삭제합니다.

interface SpaceCardProps {
  space: Space; // (수정) 임포트한 'Space' 타입 사용
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

  // (수정) API의 hostId는 string이 아닌 number일 수 있습니다. (lib/types에 따름)
  // (가정) User.id가 string이라면, space.hostId도 string으로 비교 (또는 형변환)
  const isOwner = isHost && currentUserId === String(space.hostId);

  // (수정) API 데이터의 null 가능성 처리
  const available = space.available ?? true; // DTO에 없다면 임시로 true
  const rating = space.rating ?? 0.0; // DTO에 없다면 0.0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <ImageWithFallback
          // (수정) space.image -> space.mainImageUrl
          src={space.mainImageUrl}
          // (수정) space.title -> space.name
          alt={space.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          {/* (수정) space.available -> available 변수 사용 */}
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "예약 가능" : "예약 불가"}
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
          {/* (수정) space.title -> space.name */}
          <h3 className="font-semibold line-clamp-1">{space.name}</h3>

          <p className="text-sm text-muted-foreground line-clamp-2">{space.description}</p>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 overflow-hidden">
              <MapPin className="w-4 h-4" />
              {/* (수정) space.location -> space.address */}
              <span className="truncate" title={space.address}>{space.address}</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <Users className="w-4 h-4" />
              <span>{space.capacity}명</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {/* (수정) space.rating -> rating 변수 사용 */}
              <span className="text-sm">{rating.toFixed(1)}</span>
            </div>
            <div className="text-lg font-semibold">
              {/* (수정) space.price -> space.pricePerHour */}
              {space.pricePerHour.toLocaleString()}원<span className="text-sm font-normal">/시간</span>
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
              disabled={!available} // (수정)
              onClick={() => onView?.(space.id)}
            >
              {showLoginPrompt ? "상세보기" : (available ? "예약하기" : "예약 불가")}
            </Button>
            {showLoginPrompt && available && (
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