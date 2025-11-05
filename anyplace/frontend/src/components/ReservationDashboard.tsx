import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, Phone, Mail, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

interface ReservationDashboardProps {
  isHost: boolean;
  userId: string;
  reservations: any[];
  onUpdateReservation: (reservationId: string, status: string) => void;
  onCancelReservation: (reservationId: string) => void;
}

export function ReservationDashboard({ 
  isHost, 
  userId, 
  reservations, 
  onUpdateReservation, 
  onCancelReservation 
}: ReservationDashboardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '승인 대기', variant: 'secondary' as const },
      confirmed: { label: '확정', variant: 'default' as const },
      completed: { label: '완료', variant: 'outline' as const },
      cancelled: { label: '취소', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleApprove = (reservationId: string) => {
    onUpdateReservation(reservationId, 'confirmed');
    toast.success('예약이 승인되었습니다');
  };

  const handleReject = (reservationId: string) => {
    onUpdateReservation(reservationId, 'cancelled');
    toast.success('예약이 거절되었습니다');
  };

  const handleCancel = (reservationId: string) => {
    onCancelReservation(reservationId);
    toast.success('예약이 취소되었습니다');
  };

  const userReservations = reservations.filter(r => r.userId === userId);
  const hostReservations = reservations.filter(r => r.hostId === userId);

  const pendingReservations = hostReservations.filter(r => r.status === 'pending');
  const confirmedReservations = hostReservations.filter(r => r.status === 'confirmed');

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
              <div className="text-2xl font-bold text-primary">{hostReservations.length}</div>
              <div className="text-xs text-muted-foreground">총 예약</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              승인 대기 ({pendingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              확정 예약 ({confirmedReservations.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              전체 예약 ({hostReservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingReservations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">승인 대기 중인 예약이 없습니다</p>
                </CardContent>
              </Card>
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
                        <span>{new Date(reservation.date).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.startTime} - {reservation.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.headCount}명</span>
                      </div>
                      <div className="font-semibold">
                        {reservation.totalAmount?.toLocaleString()}원
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-1">
                          <p className="font-medium text-lg">예약자: {reservation.userName}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{reservation.userPhone || '010-1234-5678'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{reservation.userEmail}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(reservation.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">결제 방법:</span>
                          <span className="ml-2 font-medium">{reservation.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">예약 일시:</span>
                          <span className="ml-2 font-medium">{new Date(reservation.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedReservations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">확정된 예약이 없습니다</p>
                </CardContent>
              </Card>
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
                        <span>{new Date(reservation.date).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.startTime} - {reservation.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.headCount}명</span>
                      </div>
                      <div className="font-semibold">
                        {reservation.totalAmount?.toLocaleString()}원
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="space-y-1 mb-3">
                        <p className="font-medium text-lg">예약자: {reservation.userName}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{reservation.userPhone || '010-1234-5678'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{reservation.userEmail}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">결제 방법:</span>
                          <span className="ml-2 font-medium">{reservation.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">예약 일시:</span>
                          <span className="ml-2 font-medium">{new Date(reservation.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {hostReservations.map((reservation) => (
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
                      <span>{new Date(reservation.date).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{reservation.headCount}명</span>
                    </div>
                    <div className="font-semibold">
                      {reservation.totalAmount?.toLocaleString()}원
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="space-y-1 mb-3">
                      <p className="font-medium text-lg">예약자: {reservation.userName}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{reservation.userPhone || '010-1234-5678'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{reservation.userEmail}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">결제 방법:</span>
                        <span className="ml-2 font-medium">{reservation.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">예약 일시:</span>
                        <span className="ml-2 font-medium">{new Date(reservation.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // User view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">내 예약</h2>
        <div className="text-sm text-muted-foreground">
          총 {userReservations.length}건의 예약
        </div>
      </div>

      {userReservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">예약 내역이 없습니다</p>
            <Button>공간 둘러보기</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userReservations.map((reservation) => (
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
                        {reservation.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleCancel(reservation.id)}>
                            예약 취소
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          예약 상세보기
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
                    <span>{new Date(reservation.date).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.startTime} - {reservation.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.headCount}명</span>
                  </div>
                  <div className="font-semibold">
                    {reservation.totalAmount?.toLocaleString()}원
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{reservation.spaceLocation}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}