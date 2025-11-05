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

// Lazy load heavy components
const SpaceRegistration = React.lazy(() => import('./components/SpaceRegistration').then(m => ({ default: m.SpaceRegistration })));
const SpaceDetail = React.lazy(() => import('./components/SpaceDetail').then(m => ({ default: m.SpaceDetail })));
const BookingModal = React.lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const ReservationDashboard = React.lazy(() => import('./components/ReservationDashboard').then(m => ({ default: m.ReservationDashboard })));

// Mock data
const initialSpaces = [
  {
    id: '1',
    title: '강남 프리미엄 회의실',
    description: '최신 시설을 갖춘 프리미엄 회의실입니다. 프레젠테이션 장비와 화이트보드가 구비되어 있습니다.',
    location: '강남구',
    capacity: 12,
    price: 50000,
    type: '회의실',
    image: 'https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZXxlbnwxfHx8fDE3NTc2ODIzNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    available: true,
    hostId: '1'
  },
  {
    id: '2',
    title: '홍대 프로 녹음실',
    description: '프로페셔널한 녹음 작업을 위한 고급 녹음실입니다. 최신 장비와 방음 시설이 완비되어 있습니다.',
    location: '마포구',
    capacity: 6,
    price: 80000,
    type: '녹음실',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNvcmRpbmclMjBzdHVkaW98ZW58MXx8fHwxNzU3Njg4NDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    available: true,
    hostId: '2'
  },
  {
    id: '3',
    title: '이태원 럭셔리 파티룸',
    description: '특별한 파티와 모임을 위한 럭셔리한 파티룸입니다. 조명 시설과 음향 장비가 완비되어 있습니다.',
    location: '용산구',
    capacity: 25,
    price: 120000,
    type: '파티룸',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMHJvb218ZW58MXx8fHwxNzU3Njg4NDU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.9,
    available: true,
    hostId: '3'
  },
  {
    id: '4',
    title: '종로 모던 세미나실',
    description: '교육과 세미나를 위한 현대적인 세미나실입니다. 최신 AV 시설과 편안한 좌석이 구비되어 있습니다.',
    location: '종로구',
    capacity: 40,
    price: 60000,
    type: '세미나실',
    image: 'https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMG9mZmljZXxlbnwxfHx8fDE3NTc2Mzk2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    available: false,
    hostId: '4'
  },
  {
    id: '5',
    title: '성수동 댄스 연습실',
    description: '댄스와 퍼포먼스 연습을 위한 전문 연습실입니다. 거울과 음향 시설이 완벽하게 갖춰져 있습니다.',
    location: '성동구',
    capacity: 15,
    price: 40000,
    type: '연습실',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMHN0dWRpb3xlbnwxfHx8fDE3NTc2ODg0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    available: true,
    hostId: '5'
  }
];

interface SearchFilters {
  query: string;
  location: string;
  type: string;
  capacity: string;
  priceRange: string;
  checkInDate: string;
  checkOutDate: string;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSpaceRegistration, setShowSpaceRegistration] = useState(false);
  const [showSpaceDetail, setShowSpaceDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [spaces, setSpaces] = useState(initialSpaces);
  const [filteredSpaces, setFilteredSpaces] = useState(initialSpaces);
  const [isSearched, setIsSearched] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false);
  // Sample reservation data for testing
  const initialReservations = [
    {
      id: 'reservation_001',
      spaceId: '1',
      spaceName: '강남 프리미엄 회의실',
      spaceLocation: '강남구',
      date: new Date('2025-01-25').toISOString(),
      startTime: '10:00',
      endTime: '14:00',
      headCount: 8,
      totalAmount: 200000,
      userId: 'guest_001',
      userName: '김민수',
      userEmail: 'minsu.kim@example.com',
      userPhone: '010-1234-5678',
      hostId: '1',
      status: 'pending',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-20').toISOString()
    },
    {
      id: 'reservation_002',
      spaceId: '1',
      spaceName: '강남 프리미엄 회의실',
      spaceLocation: '강남구',
      date: new Date('2025-01-28').toISOString(),
      startTime: '15:00',
      endTime: '18:00',
      headCount: 6,
      totalAmount: 150000,
      userId: 'guest_002',
      userName: '이지은',
      userEmail: 'jieun.lee@example.com',
      userPhone: '010-2345-6789',
      hostId: '1',
      status: 'confirmed',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-18').toISOString()
    },
    {
      id: 'reservation_003',
      spaceId: '2',
      spaceName: '홍대 프로 녹음실',
      spaceLocation: '마포구',
      date: new Date('2025-01-26').toISOString(),
      startTime: '19:00',
      endTime: '23:00',
      headCount: 4,
      totalAmount: 320000,
      userId: 'guest_003',
      userName: '박준호',
      userEmail: 'junho.park@example.com',
      userPhone: '010-3456-7890',
      hostId: '2',
      status: 'pending',
      paymentMethod: '계좌이체',
      createdAt: new Date('2025-01-21').toISOString()
    },
    {
      id: 'reservation_004',
      spaceId: '3',
      spaceName: '이태원 럭셔리 파티룸',
      spaceLocation: '용산구',
      date: new Date('2025-02-01').toISOString(),
      startTime: '18:00',
      endTime: '22:00',
      headCount: 20,
      totalAmount: 480000,
      userId: 'guest_004',
      userName: '최서연',
      userEmail: 'seoyeon.choi@example.com',
      userPhone: '010-4567-8901',
      hostId: '3',
      status: 'confirmed',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-15').toISOString()
    },
    {
      id: 'reservation_005',
      spaceId: '3',
      spaceName: '이태원 럭셔리 파티룸',
      spaceLocation: '용산구',
      date: new Date('2025-02-05').toISOString(),
      startTime: '20:00',
      endTime: '24:00',
      headCount: 15,
      totalAmount: 480000,
      userId: 'guest_005',
      userName: '정태현',
      userEmail: 'taehyun.jung@example.com',
      userPhone: '010-5678-9012',
      hostId: '3',
      status: 'pending',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-22').toISOString()
    },
    {
      id: 'reservation_006',
      spaceId: '4',
      spaceName: '종로 모던 세미나실',
      spaceLocation: '종로구',
      date: new Date('2025-01-30').toISOString(),
      startTime: '09:00',
      endTime: '17:00',
      headCount: 35,
      totalAmount: 480000,
      userId: 'guest_006',
      userName: '윤소희',
      userEmail: 'sohee.yoon@example.com',
      userPhone: '010-6789-0123',
      hostId: '4',
      status: 'confirmed',
      paymentMethod: '계좌이체',
      createdAt: new Date('2025-01-10').toISOString()
    },
    {
      id: 'reservation_007',
      spaceId: '5',
      spaceName: '성수동 댄스 연습실',
      spaceLocation: '성동구',
      date: new Date('2025-01-24').toISOString(),
      startTime: '14:00',
      endTime: '18:00',
      headCount: 12,
      totalAmount: 160000,
      userId: 'guest_007',
      userName: '강민지',
      userEmail: 'minji.kang@example.com',
      userPhone: '010-7890-1234',
      hostId: '5',
      status: 'pending',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-19').toISOString()
    },
    {
      id: 'reservation_008',
      spaceId: '5',
      spaceName: '성수동 댄스 연습실',
      spaceLocation: '성동구',
      date: new Date('2025-01-27').toISOString(),
      startTime: '10:00',
      endTime: '14:00',
      headCount: 8,
      totalAmount: 160000,
      userId: 'guest_008',
      userName: '조현우',
      userEmail: 'hyunwoo.cho@example.com',
      userPhone: '010-8901-2345',
      hostId: '5',
      status: 'cancelled',
      paymentMethod: '카드',
      createdAt: new Date('2025-01-17').toISOString()
    }
  ];

  const [reservations, setReservations] = useState(initialReservations);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('home');
  const [favoriteSpaces, setFavoriteSpaces] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load favorites and recently viewed from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('anyplace_favorites');
    const savedRecentlyViewed = localStorage.getItem('anyplace_recently_viewed');

    if (savedFavorites) {
      setFavoriteSpaces(JSON.parse(savedFavorites));
    }

    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('anyplace_favorites', JSON.stringify(favoriteSpaces));
  }, [favoriteSpaces]);

  // Save recently viewed to localStorage whenever it changes
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
    // Note: We keep favorites and recently viewed data even after logout
    // Users can clear this manually if needed
    toast.success('로그아웃되었습니다');
  }, []);

  const handleToggleHostMode = useCallback(() => {
    setIsHost(!isHost);
    toast.success(isHost ? '게스트 모드로 전환되었습니다' : '호스트 모드로 전환되었습니다');
  }, [isHost]);

  const handleSpaceRegistration = (spaceData: any) => {
    const newSpace = {
      ...spaceData,
      hostId: user?.id || '1'
    };
    setSpaces([newSpace, ...spaces]);
    setFilteredSpaces([newSpace, ...filteredSpaces]);
  };

  const handleDeleteSpace = (spaceId: string) => {
    setSpaces(spaces.filter(space => space.id !== spaceId));
    setFilteredSpaces(filteredSpaces.filter(space => space.id !== spaceId));
    toast.success('공간이 삭제되었습니다');
  };

  const handleSearch = useCallback((filters: SearchFilters) => {
    let filtered = [...spaces];

    // 검색이 실행되었다는 상태를 설정
    setIsSearched(true);

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(space =>
        space.title.toLowerCase().includes(query) ||
        space.description.toLowerCase().includes(query) ||
        space.location.toLowerCase().includes(query)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(space => space.location.includes(filters.location));
    }

    if (filters.type) {
      filtered = filtered.filter(space => space.type === filters.type);
    }

    if (filters.capacity) {
      const [min, max] = filters.capacity.split('-').map(n => n.replace('+', ''));
      filtered = filtered.filter(space => {
        if (filters.capacity === '21+') return space.capacity >= 21;
        return space.capacity >= parseInt(min) && space.capacity <= (parseInt(max) || parseInt(min) + 4);
      });
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(n => n.replace('+', ''));
      filtered = filtered.filter(space => {
        if (filters.priceRange === '100000+') return space.price >= 100000;
        return space.price >= parseInt(min) && space.price <= (parseInt(max) || Infinity);
      });
    }

    setFilteredSpaces(filtered);
    toast.success(`${filtered.length}개의 공간을 찾았습니다`);

    // 검색 결과 섹션으로 스크롤
    setTimeout(() => {
      const searchResultsElement = document.getElementById('search-results-section');
      if (searchResultsElement) {
        searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [spaces]);

  const handleClearFilters = () => {
    setFilteredSpaces(spaces);
    setIsSearched(false); // 필터 초기화 시 검색 상태도 초기화
    setShowAllMode(false); // 전체보기 모드도 초기화
    toast.success(`전체 ${spaces.length}개 공간을 표시합니다`);
  };

  const handleShowAllSpaces = () => {
    setFilteredSpaces(spaces);
    setIsSearched(false); // 검색 상태 초기화
    setShowAllMode(true); // 전체보기 모드 활성화 (추천 섹션 숨김)
    toast.success(`전체 ${spaces.length}개 공간을 표시합니다`);
  };

  const handleQuickFilter = (filters: {
    date: string;
    location: string;
    capacity: number;
    spaceType: string;
  }) => {
    let filtered = [...spaces];

    // 검색이 실행되었다는 상태를 설정
    setIsSearched(true);

    if (filters.location) {
      filtered = filtered.filter(space => space.location.includes(filters.location));
    }

    if (filters.spaceType) {
      filtered = filtered.filter(space => space.type === filters.spaceType);
    }

    if (filters.capacity > 0) {
      filtered = filtered.filter(space => space.capacity >= filters.capacity);
    }

    // Note: Date filtering would be implemented with actual booking data
    // For now, we just filter by other criteria

    setFilteredSpaces(filtered);
    toast.success(`${filtered.length}개의 공간을 찾았습니다`);

    // 검색 결과 섹션으로 스크롤
    setTimeout(() => {
      const searchResultsElement = document.getElementById('search-results-section');
      if (searchResultsElement) {
        searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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
      spaceLocation: selectedSpace?.location,
      status: 'pending'
    };

    setReservations([...reservations, newReservation]);
    setShowPaymentModal(false);
    setSelectedSpace(null);
    setBookingData(null);
    toast.success('예약이 완료되었습니다!');
  };

  const handleUpdateReservation = (reservationId: string, status: string) => {
    setReservations(reservations.map(r =>
      r.id === reservationId ? { ...r, status } : r
    ));
  };

  const handleCancelReservation = (reservationId: string) => {
    setReservations(reservations.map(r =>
      r.id === reservationId ? { ...r, status: 'cancelled' } : r
    ));
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleResetToHome = useCallback(() => {
    // 완전 초기 화면으로 리다이렉트
    setCurrentView('home');
    setShowSpaceDetail(false);
    setShowBookingModal(false);
    setShowPaymentModal(false);
    setShowSpaceRegistration(false);
    setSelectedSpace(null);
    setBookingData(null);
    setFilteredSpaces(spaces); // 모든 필터 제거
    setIsSearched(false); // 검색 상태도 초기화
    setShowAllMode(false); // 전체보기 모드도 초기화
    toast.success('홈으로 돌아왔습니다');
  }, [spaces]);

  const handleToggleFavorite = useCallback((spaceId: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      setShowAuthModal(true);
      return;
    }

    setFavoriteSpaces(prev => {
      const isFavorited = prev.includes(spaceId);
      if (isFavorited) {
        toast.success('찜 목록에서 제거되었습니다');
        return prev.filter(id => id !== spaceId);
      } else {
        toast.success('찜 목록에 추가되었습니다');
        return [...prev, spaceId];
      }
    });
  }, [user]);

  const addToRecentlyViewed = useCallback((spaceId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== spaceId);
      return [spaceId, ...filtered].slice(0, 10); // Keep only last 10 viewed
    });
  }, []);

  const mySpaces = useMemo(() =>
    isHost ? filteredSpaces.filter(space => space.hostId === user?.id) : [],
    [isHost, filteredSpaces, user?.id]
  );

  const displaySpaces = useMemo(() =>
    isHost ? mySpaces : filteredSpaces,
    [isHost, mySpaces, filteredSpaces]
  );

  // Recommended spaces based on rating and availability
  const recommendedSpaces = useMemo(() =>
    spaces
      .filter(space => space.available)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6),
    [spaces]
  );

  // Popular spaces based on rating
  const popularSpaces = useMemo(() =>
    spaces
      .filter(space => space.available && space.rating >= 4.6)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6),
    [spaces]
  );

  // Recently viewed spaces
  const recentlyViewedSpaces = useMemo(() =>
    recentlyViewed
      .map(id => spaces.find(space => space.id === id))
      .filter(Boolean)
      .slice(0, 6),
    [recentlyViewed, spaces]
  );

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
        {/* Reservations View */}
        {user && currentView === 'reservations' && (
          <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>}>
            <ReservationDashboard
              isHost={isHost}
              userId={user.id}
              reservations={reservations}
              onUpdateReservation={handleUpdateReservation}
              onCancelReservation={handleCancelReservation}
            />
          </Suspense>
        )}

        {/* Favorites View */}
        {user && currentView === 'favorites' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">찜한 공간</h2>
              <p className="text-muted-foreground">마음에 든 공간들을 모아보세요</p>
            </div>

            {favoriteSpaces.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">찜한 공간이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  마음에 드는 공간을 찜해보세요
                </p>
                <Button onClick={() => handleNavigate('home')}>
                  공간 둘러보기
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {favoriteSpaces.map((spaceId) => {
                  const space = spaces.find(s => s.id === spaceId);
                  return space ? (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      isHost={false}
                      currentUserId={user?.id}
                      onView={handleViewSpace}
                      isFavorited={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Home View */}
        {currentView === 'home' && (
          <>
            {/* Hero Section with Quick Filter */}
            {!user && (
              <div className="text-center py-16 px-4">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                  어떤 공간이든, anyplace에서
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  회의실, 파티룸, 녹음실부터 연습실까지 - 필요한 모든 공간을 anyplace에서 찾아보세요
                </p>

                {/* Quick Filter for non-logged in users */}
                <div className="max-w-5xl mx-auto mb-8">
                  <QuickFilter onSearch={handleQuickFilter} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" onClick={() => setShowAuthModal(true)}>
                    로그인하고 시작하기
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    또는 아래에서 바로 공간을 둘러보세요
                  </p>
                </div>
              </div>
            )}

            {/* Host Actions */}
            {user && isHost && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">내 공간 관리</h2>
                    <p className="text-muted-foreground">등록한 공간을 관리하고 새로운 공간을 추가하세요</p>
                  </div>
                  <Button onClick={() => startTransition(() => setShowSpaceRegistration(true))}>
                    <Plus className="w-4 h-4 mr-2" />
                    공간 등록
                  </Button>
                </div>
              </div>
            )}

            {/* Search Section */}
            {user && !isHost && (
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">공간 찾기</h2>
                  <p className="text-muted-foreground">원하는 조건의 공간을 검색해보세요</p>
                </div>
                <QuickFilter onSearch={handleQuickFilter} />
              </div>
            )}

            {/* Login Prompt for Better Experience */}
            {!user && filteredSpaces.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">더 많은 기능을 이용해보세요</h3>
                    <p className="text-muted-foreground text-sm">
                      로그인하시면 공간 예약, 찜하기, 리뷰 작성 등 다양한 기능을 이용하실 수 있습니다
                    </p>
                  </div>
                  <Button onClick={() => setShowAuthModal(true)} className="shrink-0">
                    로그인하기
                  </Button>
                </div>
              </div>
            )}

            {/* Personalized Sections Container - 검색하지 않고 전체보기 모드가 아닌 경우에만 표시 */}
            {(recommendedSpaces.length > 0 || popularSpaces.length > 0 || recentlyViewedSpaces.length > 0) && !isHost && !isSearched && !showAllMode && (
              <div className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 rounded-2xl p-8 border border-primary/10 space-y-12 mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">당신을 위한 추천</h2>
                  <p className="text-muted-foreground">개인화된 공간 추천을 확인해보세요</p>
                </div>

                {/* Recommended Spaces Section */}
                {recommendedSpaces.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                        <div>
                          <h3 className="text-2xl font-bold">추천 공간</h3>
                          <p className="text-muted-foreground">높은 평점을 받은 인기 공간들을 만나보세요</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedSpaces.map((space) => (
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
                  </div>
                )}

                {/* Separator */}
                {recommendedSpaces.length > 0 && popularSpaces.length > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full max-w-md"></div>
                  </div>
                )}

                {/* Popular Spaces Section */}
                {popularSpaces.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-chart-1 to-chart-1/60 rounded-full"></div>
                        <div>
                          <h3 className="text-2xl font-bold">지금 인기 많은 공간</h3>
                          <p className="text-muted-foreground">4.6점 이상의 높은 평점을 받은 공간들</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {popularSpaces.map((space) => (
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
                  </div>
                )}

                {/* Separator */}
                {(recommendedSpaces.length > 0 || popularSpaces.length > 0) && recentlyViewedSpaces.length > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full max-w-md"></div>
                  </div>
                )}

                {/* Recently Viewed Section */}
                {recentlyViewedSpaces.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-chart-2 to-chart-2/60 rounded-full"></div>
                        <div>
                          <h3 className="text-2xl font-bold">최근 본 공간</h3>
                          <p className="text-muted-foreground">최근에 확인한 공간들을 다시 보세요</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentlyViewedSpaces.map((space) => (
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
                  </div>
                )}
              </div>
            )}

            {/* Search Results Alert - 검색했을 때만 표시 */}
            {isSearched && !showAllMode && !isHost && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 mb-8" id="search-results-section">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Grid className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">검색 결과</h3>
                      <p className="text-sm text-muted-foreground">
                        조건에 맞는 <span className="font-semibold text-primary">{filteredSpaces.length}개</span>의 공간을 찾았습니다
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleShowAllSpaces}
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    전체 보기 ({spaces.length}개)
                  </Button>
                </div>
              </div>
            )}

            {/* Spaces Section - Enhanced Design */}
            <div className="bg-gradient-to-br from-secondary/20 via-transparent to-accent/30 rounded-2xl p-8 border border-secondary/30 space-y-8" id="spaces-section">
              {/* Section Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-chart-3 to-chart-3/60 rounded-full"></div>
                  <h2 className="text-3xl font-bold">
                    {user && isHost ? '내 공간 관리' : '모든 공간'}
                  </h2>
                  <div className="w-2 h-8 bg-gradient-to-b from-chart-3 to-chart-3/60 rounded-full"></div>
                </div>
                <p className="text-muted-foreground">
                  {user && isHost
                    ? '등록한 공간을 효율적으로 관리하세요'
                    : 'anyplace에서 제공하는 다양한 공간들을 둘러보세요'
                  }
                </p>
              </div>

              {/* Filter Status and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background/50 rounded-xl border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-medium">
                      {displaySpaces.length}개 공간
                    </Badge>
                    {isSearched && !showAllMode && (
                      <>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          검색 결과
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-xs h-7 px-3 hover:bg-primary/10 text-primary"
                        >
                          필터 초기화
                        </Button>
                      </>
                    )}
                    {showAllMode && (
                      <>
                        <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
                          전체 공간
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-xs h-7 px-3 hover:bg-chart-3/10 text-chart-3"
                        >
                          홈으로 돌아가기
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">보기:</span>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Spaces Content */}
              {displaySpaces.length === 0 ? (
                <div className="text-center py-16 bg-background/30 rounded-xl border border-dashed border-border">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {user && isHost ? (
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Grid className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {user && isHost ? '등록된 공간이 없습니다' : '검색 결과가 없습니다'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {user && isHost
                      ? '첫 번째 공간을 등록하고 호스팅을 시작해보세요'
                      : '다른 조건으로 검색해보시거나 모든 공간을 둘러보세요'
                    }
                  </p>
                  {user && isHost ? (
                    <Button
                      onClick={() => startTransition(() => setShowSpaceRegistration(true))}
                      size="lg"
                      className="shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      공간 등록하기
                    </Button>
                  ) : (
                    <Button
                      onClick={handleShowAllSpaces}
                      size="lg"
                      variant="outline"
                      className="shadow-lg"
                    >
                      모든 공간 보기
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  {!isHost && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-background/30 rounded-xl">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {displaySpaces.filter(s => s.available).length}
                        </div>
                        <div className="text-xs text-muted-foreground">예약 가능</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-1">
                          {displaySpaces.filter(s => s.rating >= 4.5).length}
                        </div>
                        <div className="text-xs text-muted-foreground">고평점 공간</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-2">
                          {new Set(displaySpaces.map(s => s.location)).size}
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
                </div>
              )}
            </div>


          </>
        )}
      </main>

      {/* Modals */}
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