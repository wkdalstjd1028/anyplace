import React, { useState, useEffect, useMemo, useCallback, Suspense, startTransition } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal'; // (추가) AuthModal 임포트
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

  // ★ (수정) isHost 상태를 user의 role로부터 '파생'시킵니다.
  const isHost = useMemo(() => {
    if (!user) return false;
    // Spring의 Role.java 키("ROLE_HOST", "ROLE_ADMIN")와 일치해야 합니다.
    return user.role === 'ROLE_HOST' || user.role === 'ROLE_ADMIN';
  }, [user]); // user 객체가 바뀔 때만 재계산됩니다.

  const [showAuthModal, setShowAuthModal] = useState(false); // (추가) 모달 상태
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

  // (수정) 1. 이 함수는 모달을 띄우는 역할만 합니다.
  const handleShowLoginModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // (수정) 2. 이 함수가 모달로부터 'google', 'kakao' 등을 받아 OIDC 리디렉션을 실행합니다.
  const handleOidcLogin = useCallback((provider: 'google' | 'kakao' | 'naver') => {
    authService.redirectToOidcLogin(provider);
    // (참고: kakao, naver는 Spring Boot application.yml에 추가 설정이 필요합니다)
  }, []);

  // OIDC 로그아웃 핸들러 (authService 사용)
  const handleLogout = useCallback(() => {
    authService.logout();
  }, []);

  // 로그인 상태 확인 (authService 사용)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await authService.getCurrentUser(); // /api/me 호출
        setUser(userData);
      } catch (error) {
        console.log("Not logged in (this is normal)");
      }
    };
    checkLoginStatus();
  }, []);

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

  // ★ (수정) '호스트 신청' 로직으로 변경
  const handleToggleHostMode = useCallback(() => {
    if (isHost) {
      toast.info("이미 호스트 권한을 가지고 있습니다.");
      return;
    }

    // TODO: 호스트 신청 모달을 띄웁니다. (예: setShowHostApplicationModal(true))
    console.log("호스트 신청 모달 띄우기");
    toast.info('호스트 신청 기능은 현재 개발 중입니다.');

  }, [isHost]); // user가 아닌 isHost에 의존

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

  // 'QuickFilter' 핸들러
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
      type: filters.spaceType || undefined,
      minCapacity: filters.capacity > 0 ? filters.capacity : undefined,
      checkInDate: filters.date || undefined,
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
    // addToRecentlyViewed(spaceId);
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
    // setReservations([...reservations, newReservation]);
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

  // (추천/인기/최근 본 공간 로직)
  const recommendedSpaces = useMemo(() =>
    spaces
      .filter(space => (space.available ?? true))
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
      .filter((space): space is Space => !!space)
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
        onLogin={handleShowLoginModal} // ★ (수정) 모달 띄우는 함수 연결
        onLogout={handleLogout}
        onToggleHostMode={handleToggleHostMode}
        isHost={isHost} // ★ (수정) user.role 기반으로 파생된 isHost 전달
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
              isHost={isHost} // ★ (수정) 파생된 isHost 전달
            />
          </Suspense>
        )}

        {currentView === 'favorites' && (
          <div>{/* 찜한 공간 뷰 (나중에 구현) */}</div>
        )}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* ... (Hero 섹션, QuickFilter, 로그인 유도 버튼 유지) ... */}
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
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20" id="search-results-section">
                {/* ... (기존 코드) ... */}
              </div>
            )}

            {/* Spaces Section */}
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
                 {/* ★ (수정) 파생된 isHost로 "새 공간 등록" 버튼 노출 여부 결정 */}
                 {isHost && (
                  <Button onClick={() => setShowSpaceRegistration(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 공간 등록
                  </Button>
                )}
              </div>

              {/* (Filter Status) */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b">
                {/* ... (기존 코드) ... */}
              </div>

              {/* (Spaces Content) */}
              {isLoading && spaces.length === 0 ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !isLoading && spaces.length === 0 ? (
                <div className="text-center py-16">
                   {/* ... (기존 코드) ... */}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* (Spaces Grid) */}
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }>
                    {displaySpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        isHost={user && isHost} // ★ (수정) 파생된 isHost 전달
                        currentUserId={user?.id}
                        onDelete={handleDeleteSpace}
                        onView={handleViewSpace}
                        showLoginPrompt={!user}
                        isFavorited={favoriteSpaces.includes(space.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>

                  {/* (더보기 버튼) */}
                  {pagination.page < pagination.totalPages - 1 && (
                    <div className="text-center pt-8">
                      {/* ... (기존 코드) ... */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ★ (추가) AuthModal 렌더링 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleOidcLogin} // ★ OIDC 리디렉션 함수를 모달에 전달
      />

      {/* ... (SpaceRegistration, SpaceDetail, BookingModal, PaymentModal Suspense) ... */}
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