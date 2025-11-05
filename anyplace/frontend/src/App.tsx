import React, { useState, useEffect, useMemo, useCallback, Suspense, startTransition } from 'react';
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
import { Space, SpaceSearchParams, User } from '../lib/types';

// Lazy load heavy components
const SpaceRegistration = React.lazy(() => import('./components/SpaceRegistration').then(m => ({ default: m.SpaceRegistration })));
const SpaceDetail = React.lazy(() => import('./components/SpaceDetail').then(m => ({ default: m.SpaceDetail })));
const BookingModal = React.lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const ReservationDashboard = React.lazy(() => import('./components/ReservationDashboard').then(m => ({ default: m.ReservationDashboard })));

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // (isHost 로직 - 정상)
  const isHost = useMemo(() => {
    if (!user) return false;
    return user.role === 'ROLE_HOST' || user.role === 'ROLE_ADMIN';
  }, [user]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHostApplicationModal, setShowHostApplicationModal] = useState(false);
  const [isHostLoading, setIsHostLoading] = useState(false);

  const [showSpaceRegistration, setShowSpaceRegistration] = useState(false);
  const [showSpaceDetail, setShowSpaceDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [bookingData, setBookingData] = useState(null);

  // ... (API 연동 상태 등) ...
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearched, setIsSearched] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  });
  const [currentFilters, setCurrentFilters] = useState<SpaceSearchParams>({});
  const [reservations, setReservations] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('home');
  const [favoriteSpaces, setFavoriteSpaces] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);


  // (AuthModal 띄우기)
  const handleShowLoginModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // (AuthModal에서 로그인 실행)
  const handleOidcLogin = useCallback((provider: 'google' | 'kakao' | 'naver') => {
    authService.redirectToOidcLogin(provider);
  }, []);

  // 로그아웃
  const handleLogout = useCallback(() => {
    authService.logout();
  }, []);

  // 로그인 상태 확인 (페이지 로드 시)
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

  // 공간 데이터 불러오기
  const fetchSpaces = useCallback(async (params: SpaceSearchParams) => {
    setIsLoading(true);
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

  // (useEffect, ... 나머지 핸들러들 ...)
  useEffect(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };
    fetchSpaces(initialParams);
    setCurrentFilters(initialParams);
    const savedFavorites = localStorage.getItem('anyplace_favorites');
    const savedRecentlyViewed = localStorage.getItem('anyplace_recently_viewed');
    if (savedFavorites) setFavoriteSpaces(JSON.parse(savedFavorites));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, [fetchSpaces, pagination.size]);

  useEffect(() => { localStorage.setItem('anyplace_favorites', JSON.stringify(favoriteSpaces)); }, [favoriteSpaces]);
  useEffect(() => { localStorage.setItem('anyplace_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // ("호스트 되기" 버튼 클릭 시)
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


  // ★★★ (수정) 공간 등록 핸들러 ★★★
  const handleSpaceRegistration = async (spaceData: any) => {
    // (수정) try/catch를 SpaceRegistration.tsx로 이동시킵니다.
    // 이 함수는 API 호출과 UI 갱신만 책임집니다.

    // 1. API 호출 (DB 저장)
    const newSpace = await spaceService.createSpace(spaceData);

    // 2. UI 갱신 (화면에 새 공간 추가)
    setSpaces(prev => [newSpace, ...prev]);
  };

  // (나머지 핸들러들 ...)
  const handleDeleteSpace = async (spaceId: string) => { /* ... */ };
  const handleClearFilters = useCallback(() => { /* ... */ }, [fetchSpaces, pagination.size]);
  const handleShowAllSpaces = () => { /* ... */ };
  const handleQuickFilter = useCallback((filters: { /* ... */ }) => { /* ... */ }, [fetchSpaces, pagination.size]);
  const handleViewSpace = (spaceId: string) => { /* ... */ };
  const handleBookSpace = (spaceId: string) => { /* ... */ };
  const handleConfirmBooking = (bookingInfo: any) => { /* ... */ };
  const handlePaymentSuccess = (paymentInfo: any) => { /* ... */ };
  const handleUpdateReservation = (reservationId: string, status: string) => { /* ... */ };
  const handleCancelReservation = (reservationId: string) => { /* ... */ };
  const handleNavigate = (view: string) => { setCurrentView(view); };
  const handleResetToHome = useCallback(() => { /* ... */ }, [handleClearFilters]);
  const handleToggleFavorite = useCallback((spaceId: string) => { /* ... */ }, []);
  const addToRecentlyViewed = useCallback((spaceId: string) => { /* ... */ }, []);
  const mySpaces = useMemo(() => isHost ? spaces.filter(space => String(space.hostId) === user?.id) : [], [isHost, spaces, user?.id]);
  const displaySpaces = useMemo(() => isHost ? mySpaces : spaces, [isHost, mySpaces, spaces]);
  const recommendedSpaces = useMemo(() => spaces.filter(space => (space.available ?? true)).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6), [spaces]);
  const popularSpaces = useMemo(() => spaces.filter(space => (space.available ?? true) && (space.rating ?? 0) >= 4.6).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6), [spaces]);
  const recentlyViewedSpaces = useMemo(() => recentlyViewed.map(id => spaces.find(space => space.id === id)).filter((space): space is Space => !!space).slice(0, 6), [recentlyViewed, spaces]);
  const handleLoadMore = () => { /* ... */ };


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
        {/* ... (Reservations, Favorites View) ... */}
        {currentView === 'reservations' && (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <ReservationDashboard
              reservations={reservations}
              onUpdateReservation={handleUpdateReservation}
              onCancelReservation={handleCancelReservation}
              isHost={isHost}
            />
          </Suspense>
        )}
        {currentView === 'favorites' && ( <div>{/* 찜한 공간 뷰 (나중에 구현) */}</div> )}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* (Hero 섹션, QuickFilter, 로그인 유도 버튼) */}
            <div className="text-center pt-16 pb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                어떤 공간이든, anyplace에서
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                회의실, 파티룸, 녹음실부터 연습실까지 - 필요한 모든 공간을 anyplace에서 찾아보세요
              </p>
            </div>
            <div className="mb-12">
              <QuickFilter onSearch={handleQuickFilter} />
            </div>
            {!user && (
              <div className="text-center mb-12">
                <Button size="lg" onClick={handleShowLoginModal}>
                  로그인하고 시작하기
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  또는 아래에서 바로 공간을 둘러보세요
                </p>
              </div>
            )}

            {/* (Search Results Alert) */}
            {isSearched && !showAllMode && !isHost && (
              <div className="mb-6 p-4 rounded-lg bg-gray-100 border" id="search-results-section">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 rounded-full bg-white border shadow-sm">
                      <Grid className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">검색 결과</h3>
                      <p className="text-sm text-muted-foreground">
                        조건에 맞는 <span className="font-semibold text-primary">{pagination.totalElements}개</span>의 공간을 찾았습니다
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleShowAllSpaces}
                    className="bg-white"
                  >
                    전체 보기 ({pagination.totalElements}개)
                  </Button>
                </div>
              </div>
            )}

            {/* (Spaces Section - 복원됨) */}
            <div className="p-6 rounded-xl border bg-card/50" id="spaces-section">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {isHost ? '내 공간 관리' : (isSearched ? '공간 목록' : '전체 공간')}
                  </h3>
                  <p className="text-muted-foreground">
                    {isHost ? '등록한 공간을 확인하고 관리하세요' : (isSearched ? '검색 조건에 맞는 공간입니다' : 'anyplace에 등록된 전체 공간입니다')}
                  </p>
                </div>
                 {isHost && (
                  <Button onClick={() => setShowSpaceRegistration(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 공간 등록
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-medium">
                    {pagination.totalElements}개 공간
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isLoading && spaces.length === 0 ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !isLoading && spaces.length === 0 ? (
                <div className="text-center py-16">
                   <h4 className="text-xl font-medium mb-2">결과 없음</h4>
                   <p className="text-muted-foreground">
                     {isSearched ? '검색 조건에 맞는 공간이 없습니다.' : '아직 등록된 공간이 없습니다.'}
                   </p>
                   {isSearched && (
                     <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                       필터 초기화
                     </Button>
                   )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }>
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
                      />
                    ))}
                  </div>

                  {pagination.page < pagination.totalPages - 1 && (
                    <div className="text-center pt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : '더보기'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* (AuthModal 렌더링) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleOidcLogin}
      />

      {/* (호스트 신청 모달 렌더링) */}
      <HostApplicationModal
        isOpen={showHostApplicationModal}
        onClose={() => setShowHostApplicationModal(false)}
        onSubmit={handleHostApplicationSubmit}
        isLoading={isHostLoading}
      />

      {/* (Suspense 컴포넌트들) */}
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        <SpaceRegistration
          isOpen={showSpaceRegistration}
          onClose={() => setShowSpaceRegistration(false)}
          onSubmit={handleSpaceRegistration}
        />
      </Suspense>
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        <SpaceDetail
          space={selectedSpace}
          isOpen={showSpaceDetail}
          onClose={() => setShowSpaceDetail(false)}
          onBook={handleBookSpace}
          user={user}
          isFavorited={selectedSpace ? favoriteSpaces.includes(selectedSpace.id) : false}
          onToggleFavorite={handleToggleFavorite}
        />
      </Suspense>
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><LoadingSpinner /></div>}>
        <BookingModal
          space={selectedSpace}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
        />
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