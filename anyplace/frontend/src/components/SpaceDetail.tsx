import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Users, Clock, Star, Wifi, Car, Coffee, Monitor, Shield, Calendar, Heart } from 'lucide-react';

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
  amenities?: string[];
  rules?: string[];
  availableHours?: string;
  reviews?: any[];
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
  if (!space) return null;

  const mockReviews = [
    {
      id: '1',
      user: '김철수',
      rating: 5,
      comment: '정말 깨끗하고 시설이 좋습니다. 회의하기에 완벽했어요!',
      date: '2024-01-15'
    },
    {
      id: '2',
      user: '이영희',
      rating: 4,
      comment: '위치도 좋고 직원분들도 친절하셨습니다.',
      date: '2024-01-10'
    }
  ];

  const mockAmenities = space.amenities || ['WiFi', '프로젝터', '화이트보드', '주차', '커피'];
  const mockRules = space.rules || [
    '금연 구역입니다',
    '음식물 반입 가능 (음주 불가)',
    '이용 후 정리정돈 필수',
    '소음 주의'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{space.title}</DialogTitle>
          <DialogDescription>
            {space.type} • {space.location} • 최대 {space.capacity}명
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and basic info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ImageWithFallback
                src={space.image}
                alt={space.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{space.rating}</span>
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
                      <span className="text-3xl font-bold">
                        {space.price.toLocaleString()}원
                      </span>
                      <span className="text-muted-foreground">/시간</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span>{space.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span>최대 {space.capacity}명</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
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
              {mockAmenities.map((amenity, index) => {
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