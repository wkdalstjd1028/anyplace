import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, Phone, Mail, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { Booking, BookingStatus, User } from '../../lib/types';
import { LoadingSpinner } from './LoadingSpinner';

interface ReservationDashboardProps {
  isHost: boolean;
  user: User | null;
  reservations: Booking[];
  onUpdateReservation: (reservationId: string, status: 'CONFIRMED' | 'REJECTED') => void;
  onCancelReservation: (reservationId: string) => void;
  isLoading: boolean;
}

export function ReservationDashboard({
  isHost,
  user,
  reservations,
  onUpdateReservation,
  onCancelReservation,
  isLoading
}: ReservationDashboardProps) {

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      PENDING: { label: '승인 대기', variant: 'secondary' as const },
      CONFIRMED: { label: '예약 확정', variant: 'default' as const },
      COMPLETED: { label: '이용 완료', variant: 'outline' as const },
      CANCELLED: { label: '취소됨', variant: 'destructive' as const },
      REJECTED: { label: '거절됨', variant: 'destructive' as const }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleApprove = (reservationId: string) => {
    onUpdateReservation(reservationId, 'CONFIRMED');
  };

  const handleReject = (reservationId: string) => {
    onUpdateReservation(reservationId, 'REJECTED');
  };

  const handleCancel = (reservationId: string) => {
    onCancelReservation(reservationId);
  };

  const pendingReservations = reservations.filter(r => r.status === 'PENDING');
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isHost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">예약 관리</h2>
            <p className="text-muted-foreground mt-1">고객의 예약을 승인하고 관리하세요</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingReservations.length}</div>
              <div className="text-xs text-muted-foreground">승인 대기</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{confirmedReservations.length}</div>
              <div className="text-xs text-muted-foreground">확정된 예약</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reservations.length}</div>
              <div className="text-xs text-muted-foreground">총 예약</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="PENDING" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PENDING">
              승인 대기 ({pendingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED">
              확정 예약 ({confirmedReservations.length})
            </TabsTrigger>
            <TabsTrigger value="ALL">
              전체 예약 ({reservations.length})
            </TabsTrigger>
          </TabsList>

          {/* 1-1. 승인 대기 탭 */}
          <TabsContent value="PENDING" className="space-y-4 mt-4">
            {pendingReservations.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">승인 대기 중인 예약이 없습니다</p></CardContent></Card>
            ) : (
              pendingReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reservation.spaceName}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(reservation.checkInDate).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.checkInTime} - {reservation.checkOutTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.guests}명</span>
                      </div>
                      <div className="font-semibold">
                        {reservation.totalPrice?.toLocaleString()}원
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-1">
                          <p className="font-medium text-lg">예약자: {reservation.userName}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{reservation.userEmail}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleApprove(reservation.id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" /> 승인
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(reservation.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> 거절
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">예약 일시:</span>
                          <span className="ml-2 font-medium">{new Date(reservation.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 1-2. 확정 예약 탭 */}
          <TabsContent value="CONFIRMED" className="space-y-4 mt-4">
            {confirmedReservations.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">확정된 예약이 없습니다</p></CardContent></Card>
            ) : (
              confirmedReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reservation.spaceName}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(reservation.checkInDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{reservation.checkInTime} - {reservation.checkOutTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{reservation.guests}명</span>
                        </div>
                        <div className="font-semibold">
                          {reservation.totalPrice?.toLocaleString()}원
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="font-medium text-lg">예약자: {reservation.userName} ({reservation.userEmail})</p>
                      </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 1-3. 전체 예약 탭 */}
          <TabsContent value="ALL" className="space-y-4 mt-4">
            {reservations.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">총 예약 내역이 없습니다</p></CardContent></Card>
            ) : (
              reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reservation.spaceName}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(reservation.checkInDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{reservation.checkInTime} - {reservation.checkOutTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{reservation.guests}명</span>
                        </div>
                        <div className="font-semibold">
                          {reservation.totalPrice?.toLocaleString()}원
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="font-medium text-lg">예약자: {reservation.userName} ({reservation.userEmail})</p>
                      </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">내 예약</h2>
        <div className="text-sm text-muted-foreground">
          총 {reservations.length}건의 예약
        </div>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">예약 내역이 없습니다</p>
            <Button>공간 둘러보기</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{reservation.spaceName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(reservation.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                          <DropdownMenuItem
                            onClick={() => handleCancel(reservation.id)}
                            className="text-red-600"
                          >
                            예약 취소
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          예약 상세보기 (TBD)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(reservation.checkInDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.checkInTime} - {reservation.checkOutTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.guests}명</span>
                  </div>
                  <div className="font-semibold">
                    {reservation.totalPrice?.toLocaleString()}원
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{reservation.spaceAddress}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReservationDashboard;