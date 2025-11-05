import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Plus, X } from 'lucide-react';

interface SpaceRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spaceData: any) => void;
}

const spaceTypes = [
  { value: '회의실', label: '회의실' },
  { value: '코워킹스페이스', label: '코워킹스페이스' },
  { value: '스튜디오', label: '스튜디오' },
  { value: '이벤트홀', label: '이벤트홀' },
  { value: '강의실', label: '강의실' },
  { value: '기타', label: '기타' }
];

const sampleImages = [
  "https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZXxlbnwxfHx8fDE3NTc2ODIzNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMG9mZmljZXxlbnwxfHx8fDE3NTc2Mzk2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NTc2MTgwODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

export function SpaceRegistration({ isOpen, onClose, onSubmit }: SpaceRegistrationProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    capacity: '',
    price: '',
    type: '',
    image: sampleImages[0],
    amenities: [] as string[]
  });

  const [newAmenity, setNewAmenity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || 
        !formData.capacity || !formData.price || !formData.type) {
      toast.error('모든 필수 필드를 입력해주세요');
      return;
    }

    const spaceData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      price: parseInt(formData.price),
      id: Date.now().toString(),
      rating: 0,
      available: true,
      hostId: '1' // Mock user ID
    };

    onSubmit(spaceData);
    toast.success('공간이 성공적으로 등록되었습니다!');
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      location: '',
      capacity: '',
      price: '',
      type: '',
      image: sampleImages[0],
      amenities: []
    });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 공간 등록</DialogTitle>
          <DialogDescription>
            공간 정보를 입력하여 새로운 공간을 등록하세요
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">공간명 *</Label>
              <Input
                id="title"
                placeholder="예: 강남 프리미엄 회의실"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">공간 유형 *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="공간 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {spaceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 *</Label>
            <Textarea
              id="description"
              placeholder="공간에 대한 자세한 설명을 입력해주세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">위치 *</Label>
            <Input
              id="location"
              placeholder="예: 서울시 강남구 테헤란로"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">수용 인원 *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="10"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">시간당 가격 (원) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="50000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>대표 이미지</Label>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((img, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                    formData.image === img ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setFormData({ ...formData, image: img })}
                >
                  <img src={img} alt={`Sample ${index + 1}`} className="w-full h-20 object-cover" />
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">편의시설</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="편의시설 추가 (예: WiFi, 프로젝터)"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              등록하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}