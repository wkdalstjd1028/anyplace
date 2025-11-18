import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator'; // (UI 구분을 위해 추가)
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import apiClient from '../lib/api'; // ★ 1. apiClient 임포트

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

// (샘플 이미지 삭제)

const initialFormState = {
  name: '',
  description: '',
  address: '',
  capacity: '',
  pricePerHour: '',
  type: '',
  mainImageUrl: '', // ★ 2. 초기값 ''로 변경
  facilities: [] as string[]
};

export function SpaceRegistration({ isOpen, onClose, onSubmit }: SpaceRegistrationProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [newFacility, setNewFacility] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★ 3. 파일 및 미리보기 State 추가
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ★ 4. (클린업) 모달이 닫히거나 파일이 변경될 때 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleResetForm = () => {
    setFormData(initialFormState);
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  }

  // ★ 5. 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // (기존 프리뷰가 있다면 해제)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      // 새 프리뷰 생성
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ★ 6. (핵심) 2단계 제출 로직
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- 1단계: 유효성 검사 ---
    if (!selectedFile) {
      toast.error('대표 이미지를 등록해주세요.');
      setIsSubmitting(false);
      return;
    }
    const capacityNum = parseInt(formData.capacity, 10);
    const priceNum = parseInt(formData.pricePerHour, 10);

    if (!formData.name || !formData.description || !formData.address || !formData.type) {
      toast.error('공간명, 유형, 설명, 위치는 필수입니다.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error('수용 인원은 1명 이상이어야 합니다.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('시간당 가격은 0 이상이어야 합니다.');
      setIsSubmitting(false);
      return;
    }

    let uploadedImageUrl = '';

    // --- 2단계: 이미지 파일 업로드 ---
    try {
      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);

      const response = await apiClient.post('/api/files/upload', fileFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      uploadedImageUrl = response.data.data.fileUrl; // (FileUploadController 응답 형식)

    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("이미지 업로드에 실패했습니다.");
      setIsSubmitting(false);
      return; // 이미지 업로드 실패 시 중단
    }

    // --- 3단계: 이미지 URL + 공간 정보 최종 제출 ---
    try {
      const spaceData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        type: formData.type,
        capacity: capacityNum,
        pricePerHour: priceNum,
        mainImageUrl: uploadedImageUrl, // ★ 업로드된 URL 사용
        facilities: formData.facilities,
        imageUrls: [] // (추후 여러 이미지 업로드 시 사용)
      };

      await onSubmit(spaceData); // App.tsx의 handleSpaceRegistration 호출

      toast.success('공간이 성공적으로 등록되었습니다!');
      handleResetForm(); // 폼 리셋
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  // ★ (오타 수정) e.g.target.value -> e.target.value
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* ★ 7. (UI 수정) 대표 이미지 업로드 */}
            <div className="space-y-2">
              <Label htmlFor="mainImage">대표 이미지 *</Label>
              <Input
                id="mainImage"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-secondary file:text-secondary-foreground
                           hover:file:bg-secondary/80"
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">이미지 미리보기</p>
                  <img src={imagePreview} alt="대표 이미지 미리보기" className="w-full h-48 object-cover rounded-md border" />
                </div>
              )}
            </div>

            <Separator />

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
              <Button type="button" variant="outline" onClick={handleClose}>
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