import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { HostApplicationModal } from './components/HostApplicationModal';
import { SpaceCard } from './components/SpaceCard';
import { QuickFilter } from './components/QuickFilter';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Plus, Grid, List, Heart } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import spaceService from './service/spaceService';
import authService from './service/authService';
import bookingService from './service/bookingService';
import { Space, SpaceSearchParams, User, Booking } from '../lib/types'; // ⭐️ Booking 타입 임포트

// Lazy load heavy components
const SpaceRegistration = React.lazy(() => import('./components/SpaceRegistration').then(m => ({ default: m.SpaceRegistration })));
const SpaceDetail = React.lazy(() => import('./components/SpaceDetail').then(m => ({ default: m.SpaceDetail })));
const BookingModal = React.lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const ReservationDashboard = React.lazy(() => import('./components/ReservationDashboard').then(m => ({ default: m.ReservationDashboard })));

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const isHost = useMemo(() => {
    if (!user) return false;
    // (User.role이 'ROLE_HOST' 또는 'HOST'일 수 있으므로 startsWith 사용)
    return user.role.startsWith('HOST') || user.role.startsWith('ROLE_HOST') || user.role.startsWith('ROLE_ADMIN');
  }, [user]);

  // (모달 상태)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHostApplicationModal, setShowHostApplicationModal] = useState(false);
  const [isHostLoading, setIsHostLoading] = useState(false);
  const [showSpaceRegistration, setShowSpaceRegistration] = useState(false);
  const [showSpaceDetail, setShowSpaceDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [bookingData, setBookingData] = useState(null);

  // (API 연동 상태)
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  });
  const [currentFilters, setCurrentFilters] = useState<SpaceSearchParams>({});

  // ⭐️ 예약 데이터 상태 (타입 지정)
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [isReservationLoading, setIsReservationLoading] = useState(false);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('home');
  const [favoriteSpaces, setFavoriteSpaces] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);


  // (Auth 핸들러)
  const handleShowLoginModal = useCallback(() => { setShowAuthModal(true); }, []);
  const handleOidcLogin = useCallback((provider: 'google' | 'kakao' | 'naver') => { authService.redirectToOidcLogin(provider); }, []);
  const handleLogout = useCallback(() => { authService.logout(); }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log("Not logged in (this is normal)");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // (공간 데이터 불러오기)
  const fetchSpaces = useCallback(async (params: SpaceSearchParams) => {
    setIsLoading(true);
    const searchParamCount = Object.values(params).filter(v => v !== undefined && v !== '' && v !== 0).length;
    setIsSearched(searchParamCount > 3);
    try {
      const response = await spaceService.searchSpaces(params);
      if (params.page === 0 || params.page === undefined) {
        setSpaces(response.content);
      } else {
        setSpaces(prev => [...prev, ...response.content]);
      }
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
    } catch (err) {
      console.error("API Error fetching spaces:", err);
      toast.error('공간 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ("내 공간" 불러오기)
  const fetchMySpaces = useCallback(async (page = 0) => {
    setIsLoading(true);
    setIsSearched(false);
    try {
      const response = await spaceService.getMySpaces(page, pagination.size);
      if (page === 0) {
        setSpaces(response.content);
      } else {
        setSpaces(prev => [...prev, ...response.content]);
      }
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
    } catch (err) {
      console.error("API Error fetching my spaces:", err);
      toast.error('내 공간 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.size]);

  // ⭐️ (수정) 예약 데이터 불러오기 (호스트/사용자 공용)
  const fetchReservations = useCallback(async (page = 0) => {
    if (!user) return; // 로그인 안 했으면 실행 안 함

    setIsReservationLoading(true);
    try {
      let response;
      if (isHost) {
        // 호스트: 받은 예약 목록 (전체 상태)
        response = await bookingService.getHostBookings(page, 50); // (페이지 크기 50으로 임시 설정)
      } else {
        // 사용자: 내 예약 목록 (전체 상태)
        response = await bookingService.getMyBookings(page, 50);
      }

      if (page === 0) {
        setReservations(response.content);
      } else {
        setReservations(prev => [...prev, ...response.content]);
      }

    } catch (err) {
      console.error("API Error fetching reservations:", err);
      toast.error('예약 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsReservationLoading(false);
    }
  }, [user, isHost]); // user, isHost가 변경되면 이 함수도 새로 생성

  // (isHost 값 확정 후 기본 데이터 로드)
  useEffect(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };
    if (user === null) {
      fetchSpaces(initialParams);
      setCurrentFilters(initialParams);
    } else {
      if (isHost) {
        fetchMySpaces(0);
        setCurrentFilters({});
      } else {
        fetchSpaces(initialParams);
        setCurrentFilters(initialParams);
      }
    }

    const savedFavorites = localStorage.getItem('anyplace_favorites');
    const savedRecentlyViewed = localStorage.getItem('anyplace_recently_viewed');
    if (savedFavorites) setFavoriteSpaces(JSON.parse(savedFavorites));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, [user, isHost, fetchSpaces, fetchMySpaces, pagination.size]); // ⭐️ 'user'를 의존성에 추가

  useEffect(() => { localStorage.setItem('anyplace_favorites', JSON.stringify(favoriteSpaces)); }, [favoriteSpaces]);
  useEffect(() => { localStorage.setItem('anyplace_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // ("호스트 되기" 핸들러)
  const handleToggleHostMode = useCallback(() => {
    if (isHost) {
      toast.info("이미 호스트 권한을 가지고 있습니다.");
      return;
    }
    setShowHostApplicationModal(true);
  }, [isHost]);

  // ("호스트 신청" 모달 Submit 시)
  const handleHostApplicationSubmit = useCallback(async (data: { businessLicenseNumber: string; description: string }) => {
    setIsHostLoading(true);
    try {
      await authService.upgradeToHost(data);
      toast.success("호스트 신청이 완료되었습니다! 다시 로그인하여 권한을 갱신하세요.");
      setShowHostApplicationModal(false);
      await checkLoginStatus();
    } catch (error: any) {
      console.error("Host application failed:", error);
      toast.error(error.response?.data?.message || "호스트 신청 중 오류가 발생했습니다.");
    } finally {
      setIsHostLoading(false);
    }
  }, [checkLoginStatus]);


  const handleSpaceRegistration = async (spaceData: any) => {
    const newSpace = await spaceService.createSpace(spaceData);
    setSpaces(prev => [newSpace, ...prev]);
  };

  const handleDeleteSpace = async (spaceId: string) => { /* ... */ };

  // (필터 초기화 및 전체 공간 보기)
  const handleClearFilters = useCallback(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };
    fetchSpaces(initialParams);
    setCurrentFilters(initialParams);
  }, [fetchSpaces, pagination.size]);

  // ("검색" 핸들러)
  const handleQuickFilter = useCallback((filters: {
    date: string;
    province: string;
    district: string;
    capacity: number;
    spaceType: string;
  }) => {
    const params: SpaceSearchParams = {
      page: 0,
      size: pagination.size,
      sort: 'createdAt,desc',
      city: filters.province || undefined,
      district: filters.district || undefined,
      type: filters.spaceType || undefined,
      minCapacity: filters.capacity > 0 ? filters.capacity : undefined,
      checkInDate: filters.date || undefined,
    };
    fetchSpaces(params);
    setCurrentFilters(params);
    setTimeout(() => {
      document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [fetchSpaces, pagination.size]);


  // ("공간 상세보기" 핸들러)
  const handleViewSpace = useCallback(async (spaceId: string) => {
    if (showSpaceDetail) {
      setShowSpaceDetail(false);
      setSelectedSpace(null);
      return;
    }
    if (isDetailLoading) return;
    setIsDetailLoading(true);
    try {
      const spaceData = await spaceService.getSpaceById(spaceId);
      setSelectedSpace(spaceData);
      setShowSpaceDetail(true);
    } catch (error) {
      console.error("Failed to fetch space details:", error);
      toast.error("공간 상세 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsDetailLoading(false);
    }
  }, [isDetailLoading, showSpaceDetail]);


  // ("예약하기" 버튼 클릭 시)
  const handleBookSpace = (spaceId: string) => {
    setShowSpaceDetail(false);
    setShowBookingModal(true);
  };

  // ("결제하기" 버튼 클릭 시)
  const handleConfirmBooking = async (bookingInfo: any) => {
    const requestData = {
      spaceId: bookingInfo.spaceId,
      checkInDate: bookingInfo.date.toISOString().split('T')[0],
      checkOutDate: bookingInfo.date.toISOString().split('T')[0],
      checkInTime: bookingInfo.startTime,
      checkOutTime: bookingInfo.endTime,
      guests: bookingInfo.headCount,
      specialRequests: ''
    };
    try {
      await bookingService.createBooking(requestData);
      toast.success('예약이 성공적으로 완료되었습니다!');
      setShowBookingModal(false);
      setSelectedSpace(null);
    } catch (error: any) {
      console.error('예약 생성 실패:', error);
      const errorMessage = error.response?.data?.message || '예약에 실패했습니다. 이미 예약된 시간인지 확인해주세요.';
      toast.error(errorMessage);
    }
  };

  const handlePaymentSuccess = (paymentInfo: any) => { /* ... */ };

  // ⭐️ (수정) 예약 상태 변경 (승인/거절) - API 호출
  const handleUpdateReservation = async (reservationId: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      const updatedReservation = await bookingService.updateBookingStatus(reservationId, { status });
      // 로컬 상태(reservations) 업데이트
      setReservations(prev =>
        prev.map(res =>
          res.id === reservationId ? updatedReservation : res
        )
      );
      toast.success(`예약이 ${status === 'CONFIRMED' ? '승인' : '거절'}되었습니다.`);
    } catch (error: any) {
      console.error('예약 상태 변경 실패:', error);
      toast.error(error.response?.data?.message || '예약 상태 변경에 실패했습니다.');
    }
  };

  // ⭐️ (수정) 예약 취소 (사용자) - API 호출
  const handleCancelReservation = async (reservationId: string) => {
    try {
      const cancelledReservation = await bookingService.cancelBooking(reservationId, '사용자 취소');
      setReservations(prev =>
        prev.map(res =>
          res.id === reservationId ? cancelledReservation : res
        )
      );
      toast.success('예약이 취소되었습니다.');
    } catch (error: any) {
      console.error('예약 취소 실패:', error);
      toast.error(error.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  };

  // ⭐️ (수정) 네비게이션 핸들러 - "예약 관리" 클릭 시 데이터 로드
  const handleNavigate = (view: string) => {
    setCurrentView(view);

    if (view === 'reservations') {
      // "예약 관리" 탭 클릭 시 예약 데이터 불러오기
      fetchReservations(0);
    }
  };

  // (로고 클릭 시)
  const handleResetToHome = useCallback(() => {
    setCurrentView('home');
    setShowSpaceDetail(false);
    setSelectedSpace(null);
    setShowBookingModal(false);
    setShowPaymentModal(false);
    if (isHost) {
      fetchMySpaces(0);
    } else {
      handleClearFilters();
    }
    toast.success('홈으로 돌아왔습니다');
  }, [isHost, handleClearFilters, fetchMySpaces]);

  const handleToggleFavorite = useCallback((spaceId: string) => { /* ... */ }, []);
  const addToRecentlyViewed = useCallback((spaceId: string) => { /* ... */ }, []);

  const displaySpaces = useMemo(() => spaces, [spaces]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages - 1) {
      const nextParams = { ...currentFilters, page: pagination.page + 1 };
      if (isHost && currentView === 'home' && !isSearched) {
        fetchMySpaces(pagination.page + 1);
      } else {
        fetchSpaces(nextParams);
      }
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogin={handleShowLoginModal}
        onLogout={handleLogout}
        onToggleHostMode={handleToggleHostMode}
        isHost={isHost}
        onNavigate={handleNavigate}
        onResetToHome={handleResetToHome}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Reservations View */}
        {currentView === 'reservations' && (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <ReservationDashboard
              reservations={reservations} // ⭐️ App.tsx가 (호스트/사용자) 필터링한 목록
              onUpdateReservation={handleUpdateReservation} // ⭐️ 승인/거절 함수 전달
              onCancelReservation={handleCancelReservation} // ⭐️ 취소 함수 전달
              isHost={isHost}
              isLoading={isReservationLoading} // ⭐️ 로딩 상태 전달
              user={user} // ⭐️ 사용자 정보 전달 (필터링에 필요)
            />
          </Suspense>
        )}

        {/* (Favorites View - 생략) */}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* (Hero, QuickFilter 등 - 생략) */}
            <div className="text-center pt-16 pb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">어떤 공간이든, anyplace에서</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">회의실, 파티룸, 녹음실부터 연습실까지 - 필요한 모든 공간을 anyplace에서 찾아보세요</p>
            </div>
            <div className="mb-12">
              <QuickFilter onSearch={handleQuickFilter} />
            </div>
            {!user && (
              <div className="text-center mb-12">
                <Button size="lg" onClick={handleShowLoginModal}>로그인하고 시작하기</Button>
                <p className="text-sm text-muted-foreground mt-2">또는 아래에서 바로 공간을 둘러보세요</p>
              </div>
            )}
            {isSearched && !isHost && (
              <div className="mb-6 p-4 rounded-lg bg-gray-100 border" id="search-results-section">
                <div className="flex items-center justify-between">
                  {/* ... (생략) */}
                </div>
              </div>
            )}

            {/* (Spaces Section) */}
            <div className="p-6 rounded-xl border bg-card/50" id="spaces-section">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">{isHost ? '내 공간 관리' : (isSearched ? '검색된 공간' : '전체 공간')}</h3>
                  <p className="text-muted-foreground">{isHost ? '등록한 공간을 확인하고 관리하세요' : (isSearched ? '검색 조건에 맞는 공간입니다' : 'anyplace에 등록된 전체 공간입니다')}</p>
                </div>
                 {isHost && (
                  <Button onClick={() => setShowSpaceRegistration(true)}>
                    <Plus className="w-4 h-4 mr-2" />새 공간 등록
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b">
                {/* ... (생략) */}
              </div>

              {isLoading && spaces.length === 0 ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
              ) : !isLoading && spaces.length === 0 ? (
                <div className="text-center py-16">
                   {/* ... (생략) */}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {displaySpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        isHost={user && isHost}
                        currentUserId={user?.id}
                        onDelete={handleDeleteSpace}
                        onView={handleViewSpace}
                        showLoginPrompt={!user}
                        isFavorited={favoriteSpaces.includes(space.id)}
                        onToggleFavorite={handleToggleFavorite}
                        isLoadingDetail={isDetailLoading}
                      />
                    ))}
                  </div>
                  {pagination.page < pagination.totalPages - 1 && (
                    <div className="text-center pt-8">
                      {/* ... (생략) */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* (모달 및 Suspense 코드) */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleOidcLogin} />
      <HostApplicationModal isOpen={showHostApplicationModal} onClose={() => setShowHostApplicationModal(false)} onSubmit={handleHostApplicationSubmit} isLoading={isHostLoading} />

      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        <SpaceRegistration isOpen={showSpaceRegistration} onClose={() => setShowSpaceRegistration(false)} onSubmit={handleSpaceRegistration} />
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        {selectedSpace && (
          <SpaceDetail
            space={selectedSpace}
            isOpen={showSpaceDetail}
            onClose={() => {
              setShowSpaceDetail(false);
              setSelectedSpace(null);
            }}
            onBook={handleBookSpace}
            user={user}
            isFavorited={selectedSpace ? favoriteSpaces.includes(selectedSpace.id) : false}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        {selectedSpace && (
          <BookingModal
            space={selectedSpace}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedSpace(null);
            }}
            onConfirm={handleConfirmBooking}
          />
        )}
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        <PaymentModal
          bookingData={bookingData}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      </Suspense>

      <Toaster position="top-right" richColors />
    </div>
  );
}