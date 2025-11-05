import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface SpaceRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spaceData: any) => Promise<void>;
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
  "https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJ2Iwcm9vbSUyMG9mZmljZXxlbnwxfHx8fDE3NTc2Mzk2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NTc2MTgwODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

const initialFormState = {
  name: '',
  description: '',
  address: '',
  capacity: '',
  pricePerHour: '',
  type: '',
  mainImageUrl: sampleImages[0],
  facilities: [] as string[]
};

export function SpaceRegistration({ isOpen, onClose, onSubmit }: SpaceRegistrationProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [newFacility, setNewFacility] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // (유효성 검사)
    const capacityNum = parseInt(formData.capacity, 10);
    const priceNum = parseInt(formData.pricePerHour, 10);

    if (!formData.name || !formData.description || !formData.address || !formData.type) {
      toast.error('공간명, 유형, 설명, 위치는 필수입니다.');
      return;
    }
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error('수용 인원은 1명 이상이어야 합니다.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('시간당 가격은 0 이상이어야 합니다.');
      return;
    }

    const spaceData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      type: formData.type,
      capacity: capacityNum,
      pricePerHour: priceNum,
      mainImageUrl: formData.mainImageUrl,
      facilities: formData.facilities,
      imageUrls: []
    };

    setIsSubmitting(true);
    try {
      await onSubmit(spaceData);
      toast.success('공간이 성공적으로 등록되었습니다!');
      setFormData(initialFormState);
      onClose();

    } catch (error: any) {
      console.error("Space registration failed:", error);
      toast.error(error.response?.data?.message || '공간 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const removeFacility = (index: number) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index)
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

        <fieldset disabled={isSubmitting}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* (name) */}
              <div className="space-y-2">
                <Label htmlFor="name">공간명 *</Label>
                <Input
                  id="name"
                  placeholder="예: 강남 프리미엄 회의실"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* (type) */}
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

            {/* (description) */}
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

            {/* (address) */}
            <div className="space-y-2">
              <Label htmlFor="address">위치 *</Label>
              <Input
                id="address"
                placeholder="예: 서울시 강남구 테헤란로"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* (capacity) */}
              <div className="space-y-2">
                <Label htmlFor="capacity">수용 인원 *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="10"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>

              {/* (pricePerHour) */}
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">시간당 가격 (원) *</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  placeholder="50000"
                  min="0"
                  value={formData.pricePerHour}
                  // ★★★ (수정) e.g.target.value -> e.target.value
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                />
              </div>
            </div>

            {/* (mainImageUrl) */}
            <div className="space-y-2">
              <Label>대표 이미지</Label>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((img, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                      formData.mainImageUrl === img ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setFormData({ ...formData, mainImageUrl: img })}
                  >
                    <img src={img} alt={`Sample ${index + 1}`} className="w-full h-20 object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* (facilities) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">편의시설</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="편의시설 추가 (예: WiFi, 프로젝터)"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                  />
                  <Button type="button" onClick={addFacility} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        <span>{facility}</span>
                        <button
                          type="button"
                          onClick={() => removeFacility(index)}
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
                {isSubmitting ? <LoadingSpinner size="sm" /> : '등록하기'}
              </Button>
            </div>
          </form>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}