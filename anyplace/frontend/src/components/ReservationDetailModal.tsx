import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, Clock, MapPin, Users, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Booking, BookingStatus } from '../lib/types';

interface ReservationDetailModalProps {
  reservation: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (reservationId: string) => void;
}

export function ReservationDetailModal({ reservation, isOpen, onClose, onCancel }: ReservationDetailModalProps) {
  if (!reservation) return null;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary">승인 대기</Badge>;
      case 'CONFIRMED': return <Badge className="bg-green-600 hover:bg-green-700">예약 확정</Badge>;
      case 'COMPLETED': return <Badge variant="outline">이용 완료</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">취소됨</Badge>;
      case 'REJECTED': return <Badge variant="destructive">거절됨</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'CANCELLED':
      case 'REJECTED': return <XCircle className="w-12 h-12 text-red-600" />;
      case 'PENDING': return <AlertCircle className="w-12 h-12 text-orange-500" />;
      default: return <CheckCircle className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>예약 상세 정보</DialogTitle>
          <DialogDescription>예약 번호: {reservation.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 상태 아이콘 및 뱃지 */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-muted/30 rounded-lg">
            {getStatusIcon(reservation.status)}
            {getStatusBadge(reservation.status)}
            <h3 className="text-xl font-bold text-center">{reservation.spaceName}</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">장소</p>
                <p className="text-sm text-muted-foreground">{reservation.spaceAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">날짜</p>
                  <p className="text-sm text-muted-foreground">{reservation.checkInDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">시간</p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.checkInTime} ~ {reservation.checkOutTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">인원</p>
                  <p className="text-sm text-muted-foreground">{reservation.guests}명</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">결제 금액</p>
                  <p className="text-sm font-bold text-primary">
                    {reservation.totalPrice.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 호스트 정보 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">호스트 정보</h4>
            <p className="text-sm text-muted-foreground">호스트: {reservation.hostName}</p>
            {/* (필요 시 연락처 추가 가능) */}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              닫기
            </Button>
            {onCancel && (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onCancel(reservation.id);
                  onClose();
                }}
              >
                예약 취소
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}