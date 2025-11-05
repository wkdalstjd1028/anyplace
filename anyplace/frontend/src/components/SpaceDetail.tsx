import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Users, Clock, Star, Wifi, Car, Coffee, Monitor, Shield, Calendar, Heart } from 'lucide-react';

// ★★★ (수정) Space 인터페이스를 Spring DTO와 일치시킵니다.
interface Space {
  id: string; // Long 타입이지만 React에서는 string으로 처리할 수 있습니다.
  name: string;          // title -> name
  description: string;
  address: string;       // location -> address
  capacity: number;
  pricePerHour: number;  // price -> pricePerHour
  type: string;
  mainImageUrl: string;  // image -> mainImageUrl
  rating?: number;       // (있을 수도, 없을 수도 있음)
  available?: boolean;
  hostId: string;
  imageUrls?: string[];  // amenities, rules, availableHours 등은 DTO에 없는 필드입니다.
  facilities?: string[]; // amenities -> facilities
  // mock data 필드는 제거합니다. (amenities, rules, availableHours, reviews)
}

interface SpaceDetailProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: (spaceId: string) => void;
  user?: any;
  isFavorited?: boolean;
  onToggleFavorite?: (spaceId: string) => void;
}

const amenityIcons: { [key: string]: any } = {
  'WiFi': Wifi,
  '주차': Car,
  '커피': Coffee,
  '프로젝터': Monitor,
  '보안': Shield,
  'default': Monitor
};

export function SpaceDetail({ space, isOpen, onClose, onBook, user, isFavorited = false, onToggleFavorite }: SpaceDetailProps) {
  // ★★★ (수정) 가장 중요한 방어 코드: space가 null일 경우 즉시 null 반환
  if (!space) return null;

  // Spring DTO와 일치하는 필드를 사용하도록 변경

  // (Mock 데이터도 DTO 필드에 맞게 조정)
  const mockReviews = [
    { id: '1', user: '김철수', rating: 5, comment: '정말 깨끗하고 시설이 좋습니다.', date: '2024-01-15' },
    { id: '2', user: '이영희', rating: 4, comment: '위치도 좋고 직원분들도 친절하셨습니다.', date: '2024-01-10' }
  ];

  // ★★★ (수정) amenities -> facilities 사용
  const displayFacilities = space.facilities || ['WiFi', '프로젝터', '화이트보드', '주차', '커피'];
  const mockRules = [
    '금연 구역입니다',
    '음식물 반입 가능 (음주 불가)',
    '이용 후 정리정돈 필수',
    '소음 주의'
  ];

  // ★★★ (수정) 가격 포맷팅 안전 장치
  const formattedPrice = space.pricePerHour ? space.pricePerHour.toLocaleString() : '가격 미정';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* ★ (수정) title -> name */}
          <DialogTitle className="text-2xl">{space.name}</DialogTitle>
          <DialogDescription>
            {/* ★ (수정) location -> address */}
            {space.type} • {space.address} • 최대 {space.capacity}명
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and basic info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ImageWithFallback
                // ★ (수정) image -> mainImageUrl
                src={space.mainImageUrl}
                alt={space.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{space.rating || 0}</span> {/* (수정) rating 안전 접근 */}
                  <span className="text-muted-foreground">({mockReviews.length}개 리뷰)</span>
                </div>
                <Badge variant={space.available ? "default" : "secondary"}>
                  {space.available ? "예약 가능" : "예약 불가"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {/* ★ (수정) 가격 포맷팅에 안전 장치 적용 */}
                      <span className="text-3xl font-bold">
                        {formattedPrice}원
                      </span>
                      <span className="text-muted-foreground">/시간</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        {/* ★ (수정) location -> address */}
                        <span>{space.address}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span>최대 {space.capacity}명</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        {/* ★ (참고) availableHours 필드가 없으므로 하드코딩 유지 */}
                        <span>09:00 - 22:00 이용 가능</span>
                      </div>
                    </div>

                    {space.available && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            size="lg"
                            disabled={!user}
                            onClick={() => onBook?.(space.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {user ? "예약하기" : "로그인 후 예약 가능"}
                          </Button>
                          <Button
                            variant={isFavorited ? "default" : "outline"}
                            size="lg"
                            className="px-4"
                            onClick={() => onToggleFavorite?.(space.id)}
                          >
                            <Heart
                              className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`}
                            />
                          </Button>
                        </div>
                        {!user && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-center text-muted-foreground">
                              예약하려면 로그인이 필요합니다.
                              <br />
                              <span className="text-primary font-medium">로그인하고 더 많은 기능을 이용해보세요!</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-3">공간 소개</h3>
            <p className="text-muted-foreground leading-relaxed">{space.description}</p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-semibold mb-3">편의시설</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayFacilities.map((amenity, index) => {
                const IconComponent = amenityIcons[amenity] || amenityIcons.default;
                return (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Rules */}
          <div>
            <h3 className="text-xl font-semibold mb-3">이용 규칙</h3>
            <ul className="space-y-2">
              {mockRules.map((rule, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h3 className="text-xl font-semibold mb-3">리뷰</h3>
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{review.user}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}