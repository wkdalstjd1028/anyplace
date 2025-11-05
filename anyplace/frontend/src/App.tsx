import React, { useState, useEffect, useMemo, useCallback, Suspense, startTransition } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { SpaceCard } from './components/SpaceCard';
import { QuickFilter } from './components/QuickFilter';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Plus, Grid, List, Heart } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';

// (추가) API 서비스 및 타입 임포트
// (spaceService.ts가 default export를 사용한다고 가정)
import spaceService from './service/spaceService';
// (spaceService.ts가 import하는 공통 타입을 임포트)
import { Space, SpaceSearchParams, User } from '../lib/types';

// Lazy load heavy components
const SpaceRegistration = React.lazy(() => import('./components/SpaceRegistration').then(m => ({ default: m.SpaceRegistration })));
const SpaceDetail = React.lazy(() => import('./components/SpaceDetail').then(m => ({ default: m.SpaceDetail })));
const BookingModal = React.lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const ReservationDashboard = React.lazy(() => import('./components/ReservationDashboard').then(m => ({ default: m.ReservationDashboard })));

// (삭제) Mock data (initialSpaces) 전체 삭제

// (삭제) SearchFilters 인터페이스 (lib/types의 SpaceSearchParams로 대체)

export default function App() {
  const [user, setUser] = useState<User | null>(null); // (수정) User 타입 적용 (lib/types 가정)
  const [isHost, setIsHost] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSpaceRegistration, setShowSpaceRegistration] = useState(false);
  const [showSpaceDetail, setShowSpaceDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null); // (수정) Space 타입 적용
  const [bookingData, setBookingData] = useState(null);

  // --- (수정) API 연동을 위한 상태 ---
  const [spaces, setSpaces] = useState<Space[]>([]); // API로 받아온 공간 목록
  const [isLoading, setIsLoading] = useState(true);   // 로딩 상태
  const [isSearched, setIsSearched] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false);

  // (추가) 페이징 상태
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20, // (spaceService.ts의 기본값과 일치)
    totalPages: 0,
    totalElements: 0
  });
  // (추가) 현재 적용된 검색 필터 (페이지네이션을 위해 저장)
  const [currentFilters, setCurrentFilters] = useState<SpaceSearchParams>({});

  // (삭제) 'filteredSpaces' 상태 삭제 (서버가 필터링을 담당)

  // (삭제) Mock reservation data (initialReservations) 삭제

  const [reservations, setReservations] = useState([]); // (수정) 초기값 빈 배열
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('home');
  const [favoriteSpaces, setFavoriteSpaces] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // (추가) API로부터 데이터를 가져오는 핵심 함수
  const fetchSpaces = useCallback(async (params: SpaceSearchParams) => {
    setIsLoading(true);
    try {
      // (중요) 'spaceService'를 사용하여 실제 API 호출
      const response = await spaceService.searchSpaces(params);

      // 새 검색인 경우(page 0) 데이터 교체, 아니면 추가 (더보기)
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

  // (수정) 컴포넌트 마운트 시 첫 페이지 데이터 로드 + LocalStorage
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
  }, [fetchSpaces, pagination.size]); // (수정) 의존성 배열

  useEffect(() => {
    localStorage.setItem('anyplace_favorites', JSON.stringify(favoriteSpaces));
  }, [favoriteSpaces]);

  useEffect(() => {
    localStorage.setItem('anyplace_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const handleLogin = useCallback((userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIsHost(false);
    toast.success('로그아웃되었습니다');
  }, []);

  const handleToggleHostMode = useCallback(() => {
    setIsHost(!isHost);
    toast.success(isHost ? '게스트 모드로 전환되었습니다' : '호스트 모드로 전환되었습니다');
  }, [isHost]);

  // (수정) 공간 등록: API 호출로 변경
  const handleSpaceRegistration = async (spaceData: any) => {
    // (참고) spaceData를 spaceService.ts의 'SpaceCreateRequest' 타입으로 변환 필요
    try {
      const newSpace = await spaceService.createSpace(spaceData);
      setSpaces(prev => [newSpace, ...prev]); // 새 공간을 목록 맨 위에 추가
      toast.success('공간이 성공적으로 등록되었습니다.');
    } catch (err) {
      toast.error('공간 등록에 실패했습니다.');
    }
  };

  // (수정) 공간 삭제: API 호출로 변경
  const handleDeleteSpace = async (spaceId: string) => {
    // (참고) window.confirm 대신 toast.confirm 사용 권장
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

  // (삭제) 'handleSearch' (복잡한 버전) 함수 삭제

  // (수정) 필터 클리어: API를 다시 호출
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

  // (수정) 'QuickFilter' 핸들러: API 호출로 변경
  const handleQuickFilter = useCallback((filters: {
    date: string;
    location: string;
    capacity: number;
    spaceType: string;
  }) => {

    // QuickFilter의 간단한 필터를 백엔드 API가 이해하는 SpaceSearchParams로 변환
    const params: SpaceSearchParams = {
      page: 0,
      size: pagination.size,
      sort: 'createdAt,desc',

      // (가정) QuickFilter의 'location'은 'district' (자치구)입니다.
      district: filters.location || undefined,
      // (가정) 'city'는 '서울'로 고정합니다 (spaceService 스펙에 따름)
      city: filters.location ? '서울' : undefined,

      type: filters.spaceType || undefined,
      minCapacity: filters.capacity > 0 ? filters.capacity : undefined,

      checkInDate: filters.date || undefined,
      // (참고) checkOutDate가 없으므로, 백엔드 SpaceSpecification.java에서
      // checkInDate만 있는 경우도 처리하도록 수정이 필요할 수 있습니다.
      // (현재는 checkInDate와 checkOutDate가 모두 있어야 날짜 필터링 작동)
    };

    setIsSearched(true);
    fetchSpaces(params);    // API 호출
    setCurrentFilters(params); // 현재 필터 상태 저장

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

  // (수정) handlePaymentSuccess: API 데이터 속성 이름으로 변경
  const handlePaymentSuccess = (paymentInfo: any) => {
    const newReservation = {
      id: `reservation_${Date.now()}`,
      ...bookingData,
      ...paymentInfo,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      hostId: selectedSpace?.hostId,
      spaceLocation: selectedSpace?.address, // (수정) location -> address
      status: 'pending'
    };

    setReservations([...reservations, newReservation]);
    setShowPaymentModal(false);
    setSelectedSpace(null);
    setBookingData(null);
    toast.success('예약이 완료되었습니다!');
    // (권장) bookingService.createBooking API 호출 필요
  };

  const handleUpdateReservation = (reservationId: string, status: string) => { /* ... (유지) ... */ };
  const handleCancelReservation = (reservationId: string) => { /* ... (유지) ... */ };
  const handleNavigate = (view: string) => { /* ... (유지) ... */ };

  // (수정) handleResetToHome: 필터 클리어 함수를 호출하도록 수정
  const handleResetToHome = useCallback(() => {
    setCurrentView('home');
    setShowSpaceDetail(false);
    setShowBookingModal(false);
    setShowPaymentModal(false);
    setShowSpaceRegistration(false);
    setSelectedSpace(null);
    setBookingData(null);
    handleClearFilters(); // (수정)
    toast.success('홈으로 돌아왔습니다');
  }, [handleClearFilters]);

  const handleToggleFavorite = useCallback((spaceId: string) => { /* ... (유지) ... */ }, [user]);
  const addToRecentlyViewed = useCallback((spaceId: string) => { /* ... (유지) ... */ }, []);

  // (수정) mySpaces, displaySpaces: 'filteredSpaces' 대신 'spaces' 사용
  const mySpaces = useMemo(() =>
    isHost ? spaces.filter(space => String(space.hostId) === user?.id) : [], // (수정) ID 타입 비교
    [isHost, spaces, user?.id]
  );
  const displaySpaces = useMemo(() =>
    isHost ? mySpaces : spaces,
    [isHost, mySpaces, spaces]
  );

  // (수정) 추천/인기 공간: API에서 온 'spaces'를 사용 (Props 이름 변경됨)
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

  // (추가) '더보기' 버튼 핸들러
  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages - 1) {
      const nextParams = {
        ...currentFilters,
        page: pagination.page + 1
      };
      fetchSpaces(nextParams); // fetchSpaces가 데이터를 '추가'하도록 수정됨
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onToggleHostMode={handleToggleHostMode}
        isHost={isHost}
        onNavigate={handleNavigate}
        onResetToHome={handleResetToHome}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8">
        {/* ... (Reservations View, Favorites View 유지) ... */}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* ... (Hero, Host Actions, Search Section, Login Prompt 유지) ... */}

            {/* ... (Personalized Sections Container 유지) ... */}

            {/* (수정) Search Results Alert: pagination.totalElements 사용 */}
            {isSearched && !showAllMode && !isHost && (
              <div className="bg-gradient-to-r ... (유지)" id="search-results-section">
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
            <div className="bg-gradient-to-br ... (유지)" id="spaces-section">
              {/* ... (Section Header 유지) ... */}

              {/* (수정) Filter Status: pagination.totalElements 사용 */}
              <div className="flex flex-col sm:flex-row ... (유지)">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-medium">
                    {pagination.totalElements}개 공간
                  </Badge>
                  {/* ... (필터 상태 Badge UI 유지) ... */}
                </div>
                {/* ... (View Mode Buttons 유지) ... */}
              </div>

              {/* (수정) Spaces Content: 로딩 및 빈 상태 처리 */}
              {isLoading && spaces.length === 0 ? (
                // 1. 첫 로딩 시 스피너
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !isLoading && spaces.length === 0 ? (
                // 2. 로딩 후 결과 없음
                <div className="text-center py-16 ... (유지)">
                  {/* ... (결과 없음 UI 유지) ... */}
                </div>
              ) : (
                // 3. 결과 있음 (Grid + Load More 버튼)
                <div className="space-y-6">
                  {/* ... (Summary Stats 수정) ... */}
                  {!isHost && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-background/30 rounded-xl">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {displaySpaces.filter(s => s.available ?? true).length}
                        </div>
                        <div className="text-xs text-muted-foreground">예약 가능</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-1">
                          {displaySpaces.filter(s => (s.rating ?? 0) >= 4.5).length}
                        </div>
                        <div className="text-xs text-muted-foreground">고평점 공간</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-2">
                          {new Set(displaySpaces.map(s => s.address)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">지역</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-4">
                          {new Set(displaySpaces.map(s => s.type)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">공간 유형</div>
                      </div>
                    </div>
                  )}

                  {/* Spaces Grid */}
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }>
                    {displaySpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space} // (중요) API 데이터(Space 타입)를 전달
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
                        onClick={handleLoadMore} // (수정)
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

      {/* ... (Modals, Toaster 유지) ... */}
       <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <Suspense fallback={<div />}>
        <SpaceRegistration
          isOpen={showSpaceRegistration}
          onClose={() => setShowSpaceRegistration(false)}
          onSubmit={handleSpaceRegistration}
        />
      </Suspense>

      <Suspense fallback={<div />}>
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

      <Suspense fallback={<div />}>
        <BookingModal
          space={selectedSpace}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
        />
      </Suspense>

      <Suspense fallback={<div />}>
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