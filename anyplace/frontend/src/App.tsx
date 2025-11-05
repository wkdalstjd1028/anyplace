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
  const [isSearched, setIsSearched] = useState(false);
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


  // (Auth 핸들러)
  const handleShowLoginModal = useCallback(() => { setShowAuthModal(true); }, []);
  const handleOidcLogin = useCallback((provider: 'google' | 'kakao' | 'naver') => { authService.redirectToOidcLogin(provider); }, []);
  const handleLogout = useCallback(() => { authService.logout(); }, []);

  // (로그인 상태 확인)
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

  // (공간 데이터 불러오기 - "전체" 또는 "검색")
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

  // ★ (수정) "내 공간" 불러오기
  const fetchMySpaces = useCallback(async (page = 0) => {
    setIsLoading(true);
    setIsSearched(false);
    try {
      // ★ (수정) spaceService.getMySpaces에 page와 size만 전달합니다.
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
      // ★ "내 공간 정보를 불러오는 데 실패했습니다."가 여기서 발생합니다.
      toast.error('내 공간 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.size]); // (의존성에서 pagination.size만 남김)

  // (컴포넌트 마운트 시)
  useEffect(() => {
    // (isHost 값이 확정된 *후에* 기본 데이터를 로드)
  }, []);

  useEffect(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };

    if (isHost) {
      fetchMySpaces(0);
      setCurrentFilters({});
    } else {
      fetchSpaces(initialParams);
      setCurrentFilters(initialParams);
    }

    const savedFavorites = localStorage.getItem('anyplace_favorites');
    const savedRecentlyViewed = localStorage.getItem('anyplace_recently_viewed');
    if (savedFavorites) setFavoriteSpaces(JSON.parse(savedFavorites));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, [isHost, fetchSpaces, fetchMySpaces, pagination.size]);

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
      sort: 'createdAt,desc', // ★ (수정) 검색 시에는 정렬 파라미터를 보냅니다.
      city: filters.province || undefined,
      district: filters.district || undefined,
      type: filters.spaceType || undefined,
      minCapacity: filters.capacity > 0 ? filters.capacity : undefined,
      checkInDate: filters.date || undefined,
    };

    fetchSpaces(params);
    setCurrentFilters(params);

    setTimeout(() => {
      const searchResultsElement = document.getElementById('search-results-section');
      if (searchResultsElement) {
        searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [fetchSpaces, pagination.size]);

  // (핸들러 ...)
  const handleViewSpace = (spaceId: string) => { /* ... */ };
  const handleBookSpace = (spaceId: string) => { /* ... */ };
  const handleConfirmBooking = (bookingInfo: any) => { /* ... */ };
  const handlePaymentSuccess = (paymentInfo: any) => { /* ... */ };
  const handleUpdateReservation = (reservationId: string, status: string) => { /* ... */ };
  const handleCancelReservation = (reservationId: string) => { /* ... */ };

  // ("내 공간" / "찜한 공간" 등 네비게이션)
  const handleNavigate = (view: string) => {
    setCurrentView(view);

    if (view === 'home') {
      if (isHost) {
        fetchMySpaces(0);
      } else {
        handleClearFilters();
      }
    }
  };

  // (로고 클릭 시)
  const handleResetToHome = useCallback(() => {
    setCurrentView('home');
    // ... (모달 닫기)

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
      if (isHost && currentView === 'home' && !isSearched) { // ★ (수정) 호스트이고, 홈 뷰이고, 검색 중이 아닐 때
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
              reservations={reservations}
              onUpdateReservation={handleUpdateReservation}
              onCancelReservation={handleCancelReservation}
              isHost={isHost}
            />
          </Suspense>
        )}

        {/* Favorites View */}
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
            {isSearched && !isHost && (
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
                    onClick={handleClearFilters}
                    className="bg-white"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            )}

            {/* (Spaces Section) */}
            <div className="p-6 rounded-xl border bg-card/50" id="spaces-section">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {isHost ? '내 공간 관리' : (isSearched ? '검색된 공간' : '전체 공간')}
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
                     {isHost ? '아직 등록한 공간이 없습니다.' :
                      (isSearched ? '검색 조건에 맞는 공간이 없습니다.' : '아직 등록된 공간이 없습니다.')
                     }
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

      {/* (모달 및 Suspense 코드) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleOidcLogin}
      />
      <HostApplicationModal
        isOpen={showHostApplicationModal}
        onClose={() => setShowHostApplicationModal(false)}
        onSubmit={handleHostApplicationSubmit}
        isLoading={isHostLoading}
      />
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