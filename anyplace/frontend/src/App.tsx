import React, { useState, useEffect, useMemo, useCallback, Suspense, startTransition } from 'react';
import { Header } from './components/Header';
// import { AuthModal } from './components/AuthModal'; // (삭제) OIDC 로그인을 사용하므로 모달 삭제
import { SpaceCard } from './components/SpaceCard';
import { QuickFilter } from './components/QuickFilter';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Plus, Grid, List, Heart } from 'lucide-react';
import { toast, Toaster } from 'sonner'; // (버전 @2.0.3 제거)

// (수정) API 서비스 및 타입 임포트
import spaceService from './service/spaceService';
import { getMe } from './service/userService'; // (추가) 로그인 상태 확인 API
import { Space, SpaceSearchParams, User } from '../lib/types';

// Lazy load heavy components
const SpaceRegistration = React.lazy(() => import('./components/SpaceRegistration').then(m => ({ default: m.SpaceRegistration })));
const SpaceDetail = React.lazy(() => import('./components/SpaceDetail').then(m => ({ default: m.SpaceDetail })));
const BookingModal = React.lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const ReservationDashboard = React.lazy(() => import('./components/ReservationDashboard').then(m => ({ default: m.ReservationDashboard })));

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isHost, setIsHost] = useState(false);
  // const [showAuthModal, setShowAuthModal] = useState(false); // (삭제)
  const [showSpaceRegistration, setShowSpaceRegistration] = useState(false);
  const [showSpaceDetail, setShowSpaceDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [bookingData, setBookingData] = useState(null);

  // --- API 연동 상태 ---
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

  // (수정) OIDC 로그인 핸들러 (모달 대신 리디렉션)
  const handleOidcLogin = useCallback(() => {
    // 'google'은 application.yml에 설정한 provider-id입니다. (naver, kakao 등)
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }, []);

  // (수정) OIDC 로그아웃 핸들러 (서버 로그아웃 호출)
  const handleLogout = useCallback(() => {
    // Spring Security 기본 로그아웃 URL
    // 성공 시 Spring이 localhost:3000으로 리디렉션
    window.location.href = 'http://localhost:8080/logout';
    // (참고: SecurityConfig에서 .logout() 설정을 커스텀했다면 주소 변경 필요)
  }, []);

  // (추가) 로그인 상태 확인 (페이지 로드 시)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await getMe(); // (서버의 /api/me 호출)
        setUser(userData);
      } catch (error) {
        // 401 오류(로그인 안 됨) 등이 발생하면 user는 null로 유지됩니다.
        console.log("Not logged in (this is normal)");
      }
    };
    checkLoginStatus();
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

  // 공간 데이터 불러오기
  const fetchSpaces = useCallback(async (params: SpaceSearchParams) => {
    setIsLoading(true);
    try {
      const response = await spaceService.searchSpaces(params);

      // (수정) response.data가 아닌 response 자체를 사용 (spaceService.ts 수정됨)
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
      // 'content'를 못 읽는 오류가 여기서 발생했었음 (spaceService 수정으로 해결됨)
      toast.error('공간 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 첫 페이지 데이터 로드 + LocalStorage
  useEffect(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };
    fetchSpaces(initialParams);
    setCurrentFilters(initialParams);

    const savedFavorites = localStorage.getItem('anyplace_favorites');
    const savedRecentlyViewed = localStorage.getItem('anyplace_recently_viewed');
    if (savedFavorites) {
      setFavoriteSpaces(JSON.parse(savedFavorites));
    }
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, [fetchSpaces, pagination.size]);

  useEffect(() => {
    localStorage.setItem('anyplace_favorites', JSON.stringify(favoriteSpaces));
  }, [favoriteSpaces]);

  useEffect(() => {
    localStorage.setItem('anyplace_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // (삭제) handleLogin (AuthModal용)

  const handleToggleHostMode = useCallback(() => {
    setIsHost(!isHost);
    toast.success(isHost ? '게스트 모드로 전환되었습니다' : '호스트 모드로 전환되었습니다');
  }, [isHost]);

  const handleSpaceRegistration = async (spaceData: any) => {
    try {
      const newSpace = await spaceService.createSpace(spaceData);
      setSpaces(prev => [newSpace, ...prev]);
      toast.success('공간이 성공적으로 등록되었습니다.');
    } catch (err) {
      toast.error('공간 등록에 실패했습니다.');
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (window.confirm("정말로 이 공간을 삭제하시겠습니까?")) {
      try {
        await spaceService.deleteSpace(spaceId);
        setSpaces(prev => prev.filter(space => space.id !== spaceId));
        toast.success('공간이 삭제되었습니다');
      } catch (err) {
        toast.error('공간 삭제에 실패했습니다.');
      }
    }
  };

  const handleClearFilters = useCallback(() => {
    const initialParams: SpaceSearchParams = { page: 0, size: pagination.size, sort: 'createdAt,desc' };
    fetchSpaces(initialParams);
    setCurrentFilters(initialParams);
    setIsSearched(false);
    setShowAllMode(false);
    toast.success(`전체 공간을 다시 불러옵니다`);
  }, [fetchSpaces, pagination.size]);

  const handleShowAllSpaces = () => {
    handleClearFilters();
    setShowAllMode(true);
  };

  // 'QuickFilter' 핸들러 (수정 없음)
  const handleQuickFilter = useCallback((filters: {
    date: string;
    location: string;
    capacity: number;
    spaceType: string;
  }) => {
    const params: SpaceSearchParams = {
      page: 0,
      size: pagination.size,
      sort: 'createdAt,desc',
      district: filters.location || undefined,
      // (참고) location이 '시/도'를 포함해야 city도 동적으로 설정 가능
      city: filters.location ? '서울' : undefined, // (임시)
      type: filters.spaceType || undefined,
      minCapacity: filters.capacity > 0 ? filters.capacity : undefined,
      checkInDate: filters.date || undefined,
      // (참고) checkOutDate가 현재 필터에 없음
    };

    setIsSearched(true);
    fetchSpaces(params);
    setCurrentFilters(params);

    setTimeout(() => {
      const searchResultsElement = document.getElementById('search-results-section');
      if (searchResultsElement) {
        searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

  }, [fetchSpaces, pagination.size]);

  const handleViewSpace = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    setSelectedSpace(space);
    addToRecentlyViewed(spaceId);
    startTransition(() => {
      setShowSpaceDetail(true);
    });
  };

  const handleBookSpace = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    setSelectedSpace(space);
    setShowSpaceDetail(false);
    startTransition(() => {
      setShowBookingModal(true);
    });
  };

  const handleConfirmBooking = (bookingInfo: any) => {
    setBookingData(bookingInfo);
    setShowBookingModal(false);
    startTransition(() => {
      setShowPaymentModal(true);
    });
  };

  const handlePaymentSuccess = (paymentInfo: any) => {
    const newReservation = {
      id: `reservation_${Date.now()}`,
      ...bookingData,
      ...paymentInfo,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      hostId: selectedSpace?.hostId,
      spaceLocation: selectedSpace?.address,
      status: 'pending'
    };
    setReservations([...reservations, newReservation]);
    setShowPaymentModal(false);
    setSelectedSpace(null);
    setBookingData(null);
    toast.success('예약이 완료되었습니다!');
  };

  const handleUpdateReservation = (reservationId: string, status: string) => { /* ... */ };
  const handleCancelReservation = (reservationId: string) => { /* ... */ };
  const handleNavigate = (view: string) => { setCurrentView(view); };

  const handleResetToHome = useCallback(() => {
    setCurrentView('home');
    setShowSpaceDetail(false);
    setShowBookingModal(false);
    setShowPaymentModal(false);
    setShowSpaceRegistration(false);
    setSelectedSpace(null);
    setBookingData(null);
    handleClearFilters();
    toast.success('홈으로 돌아왔습니다');
  }, [handleClearFilters]);

  const handleToggleFavorite = useCallback((spaceId: string) => { /* ... */ }, []);
  const addToRecentlyViewed = useCallback((spaceId: string) => { /* ... */ }, []);

  const mySpaces = useMemo(() =>
    isHost ? spaces.filter(space => String(space.hostId) === user?.id) : [],
    [isHost, spaces, user?.id]
  );
  const displaySpaces = useMemo(() =>
    isHost ? mySpaces : spaces,
    [isHost, mySpaces, spaces]
  );

  // (추천/인기/최근 본 공간 로직 - spaceService에 전용 API가 있으나 일단 유지)
  const recommendedSpaces = useMemo(() =>
    spaces
      .filter(space => space.available ?? true)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6),
    [spaces]
  );
  const popularSpaces = useMemo(() =>
    spaces
      .filter(space => (space.available ?? true) && (space.rating ?? 0) >= 4.6)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6),
    [spaces]
  );
  const recentlyViewedSpaces = useMemo(() =>
    recentlyViewed
      .map(id => spaces.find(space => space.id === id))
      .filter(Boolean)
      .slice(0, 6),
    [recentlyViewed, spaces]
  );

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages - 1) {
      const nextParams = {
        ...currentFilters,
        page: pagination.page + 1
      };
      fetchSpaces(nextParams);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogin={handleOidcLogin} // (수정) OIDC 로그인 함수 연결
        onLogout={handleLogout} // (수정) OIDC 로그아웃 함수 연결
        onToggleHostMode={handleToggleHostMode}
        isHost={isHost}
        onNavigate={handleNavigate}
        onResetToHome={handleResetToHome}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8">
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

        {currentView === 'favorites' && (
          <div>{/* 찜한 공간 뷰 (나중에 구현) */}</div>
        )}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* ★★★ 1. (추가) Hero 섹션 ★★★ */}
            <div className="text-center pt-16 pb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                어떤 공간이든, anyplace에서
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                회의실, 파티룸, 녹음실부터 연습실까지 - 필요한 모든 공간을 anyplace에서 찾아보세요
              </p>
            </div>

            {/* ★★★ 2. (추가) QuickFilter 컴포넌트 ★★★ */}
            <div className="mb-12">
              <QuickFilter onSearch={handleQuickFilter} />
            </div>

            {/* ★★★ 3. (추가) 로그인 유도 (피그마 디자인) ★★★ */}
            {!user && (
              <div className="text-center mb-12">
                <Button size="lg" onClick={handleOidcLogin}>
                  로그인하고 시작하기
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  또는 아래에서 바로 공간을 둘러보세요
                </p>
              </div>
            )}

            {/* ... (Personalized Sections - 일단 주석 처리) ... */}

            {/* (수정) Search Results Alert: pagination.totalElements 사용 */}
            {isSearched && !showAllMode && !isHost && (
              // (수정) Tailwind 클래스 추가
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20" id="search-results-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-primary">검색 결과</h3>
                    <p className="text-sm text-muted-foreground">
                      조건에 맞는 <span className="font-semibold text-primary">{pagination.totalElements}개</span>의 공간을 찾았습니다
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleShowAllSpaces}
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    전체 보기 ({pagination.totalElements}개)
                  </Button>
                </div>
              </div>
            )}

            {/* Spaces Section */}
            {/* (수정) Tailwind 클래스 추가 */}
            <div className="p-6 rounded-xl border bg-card/50" id="spaces-section">
              {/* (수정) Section Header UI */}
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

              {/* (수정) Filter Status: pagination.totalElements 사용 */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-medium">
                    {pagination.totalElements}개 공간
                  </Badge>
                  {/* (필터 Badge UI는 일단 생략) */}
                </div>
                {/* (View Mode Buttons) */}
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* (수정) Spaces Content: 로딩 및 빈 상태 처리 */}
              {isLoading && spaces.length === 0 ? (
                // 1. 첫 로딩 시 스피너
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !isLoading && spaces.length === 0 ? (
                // 2. 로딩 후 결과 없음
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
                // 3. 결과 있음 (Grid + Load More 버튼)
                <div className="space-y-6">
                  {/* (Summary Stats는 일단 생략) */}

                  {/* Spaces Grid */}
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

                  {/* (추가) 더보기 버튼 */}
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

      {/* (삭제) AuthModal */}
      {/*
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
      */}

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