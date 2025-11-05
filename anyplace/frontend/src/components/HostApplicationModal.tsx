// src/components/HostApplicationModal.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface HostApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { businessLicenseNumber: string; description: string }) => void;
  isLoading: boolean;
}

export const HostApplicationModal = ({ isOpen, onClose, onSubmit, isLoading }: HostApplicationModalProps) => {
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ businessLicenseNumber, description });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>호스트 신청하기</DialogTitle>
            <DialogDescription>
              호스트가 되어 공간을 등록하고 수익을 창출하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="business-license">사업자등록번호</Label>
              <Input
                id="business-license"
                value={businessLicenseNumber}
                onChange={(e) => setBusinessLicenseNumber(e.target.value)}
                placeholder="'-' 없이 숫자만 입력하세요"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">호스트 소개</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="호스트님에 대해 간략히 소개해주세요. (10자 이상)"
                minLength={10}
                required
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '신청 중...' : '신청하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};