import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Clock, Users, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BookingModalProps {
  space: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export function BookingModal({ space, isOpen, onClose, onConfirm }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [headCount, setHeadCount] = useState<string>('');

  // Don't render if no space data
  if (!space) {
    return null;
  }

  const calculateTotal = () => {
    if (!startTime || !endTime || !space?.price) return 0;
    
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const duration = end - start;
    
    return duration > 0 ? duration * space.price : 0;
  };

  const handleConfirm = () => {
    if (!selectedDate || !startTime || !endTime || !headCount) {
      toast.error('모든 정보를 입력해주세요');
      return;
    }

    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    if (end <= start) {
      toast.error('종료 시간은 시작 시간보다 늦어야 합니다');
      return;
    }

    const bookingData = {
      spaceId: space?.id || '',
      spaceName: space?.title || '',
      date: selectedDate,
      startTime,
      endTime,
      headCount: parseInt(headCount),
      totalAmount: calculateTotal(),
      duration: end - start
    };

    onConfirm(bookingData);
  };

  const availableEndTimes = timeSlots.filter(time => {
    if (!startTime) return false;
    const startHour = parseInt(startTime.split(':')[0]);
    const timeHour = parseInt(time.split(':')[0]);
    return timeHour > startHour;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>예약하기</DialogTitle>
          <DialogDescription>
            날짜와 시간을 선택하여 공간을 예약하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Space Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{space?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{space?.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>최대 {space?.capacity}명</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">
                  {space?.price?.toLocaleString()}원/시간
                </span>
                <Badge>{space?.type}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div>
            <h3 className="font-semibold mb-3">날짜 선택</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">시작 시간</h3>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="시작 시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold mb-3">종료 시간</h3>
              <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                <SelectTrigger>
                  <SelectValue placeholder="종료 시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableEndTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Head Count */}
          <div>
            <h3 className="font-semibold mb-3">이용 인원</h3>
            <Select value={headCount} onValueChange={setHeadCount}>
              <SelectTrigger>
                <SelectValue placeholder="인원 수 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: space?.capacity || 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{num}명</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Booking Summary */}
          {startTime && endTime && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">예약 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>날짜</span>
                    <span>{selectedDate?.toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>시간</span>
                    <span>{startTime} - {endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>이용 시간</span>
                    <span>{parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])}시간</span>
                  </div>
                  <div className="flex justify-between">
                    <span>인원</span>
                    <span>{headCount}명</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>총 금액</span>
                    <span>{calculateTotal().toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              결제하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}