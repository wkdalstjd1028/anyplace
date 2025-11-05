import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, MapPin, Users, Filter, X, Calendar as CalendarIcon } from 'lucide-react';

interface SearchFilters {
  query: string;
  location: string;
  type: string;
  capacity: string;
  priceRange: string;
  checkInDate: string;
  checkOutDate: string;
}

interface SpaceSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

const spaceTypes = [
  { value: 'all', label: '전체' },
  { value: '회의실', label: '회의실' },
  { value: '파티룸', label: '파티룸' },
  { value: '녹음실', label: '녹음실' },
  { value: '스튜디오', label: '스튜디오' },
  { value: '코워킹스페이스', label: '코워킹스페이스' },
  { value: '이벤트홀', label: '이벤트홀' },
  { value: '강의실', label: '강의실' },
  { value: '연습실', label: '연습실' },
  { value: '세미나실', label: '세미나실' },
  { value: '기타', label: '기타' }
];

const capacityOptions = [
  { value: 'all', label: '전체' },
  { value: '1-5', label: '1-5명' },
  { value: '6-10', label: '6-10명' },
  { value: '11-20', label: '11-20명' },
  { value: '21+', label: '21명 이상' }
];

const priceRanges = [
  { value: 'all', label: '전체' },
  { value: '0-30000', label: '3만원 이하' },
  { value: '30000-50000', label: '3-5만원' },
  { value: '50000-100000', label: '5-10만원' },
  { value: '100000+', label: '10만원 이상' }
];

const locations = [
  { value: 'all', label: '전체 지역' },
  { value: '강남구', label: '강남구' },
  { value: '서초구', label: '서초구' },
  { value: '마포구', label: '마포구' },
  { value: '종로구', label: '종로구' },
  { value: '영등포구', label: '영등포구' }
];

export function SpaceSearch({ onSearch, onClearFilters }: SpaceSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: 'all',
    type: 'all',
    capacity: 'all',
    priceRange: 'all',
    checkInDate: '',
    checkOutDate: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      location: filters.location === 'all' ? '' : filters.location,
      type: filters.type === 'all' ? '' : filters.type,
      capacity: filters.capacity === 'all' ? '' : filters.capacity,
      priceRange: filters.priceRange === 'all' ? '' : filters.priceRange
    };
    onSearch(searchFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      query: '',
      location: 'all',
      type: 'all',
      capacity: 'all',
      priceRange: 'all',
      checkInDate: '',
      checkOutDate: ''
    };
    setFilters(clearedFilters);
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    onClearFilters();
  };

  const handleDateChange = (type: 'checkIn' | 'checkOut', date: Date | undefined) => {
    if (type === 'checkIn') {
      setCheckInDate(date);
      setFilters({ ...filters, checkInDate: date ? date.toISOString().split('T')[0] : '' });
    } else {
      setCheckOutDate(date);
      setFilters({ ...filters, checkOutDate: date ? date.toISOString().split('T')[0] : '' });
    }
  };

  const hasActiveFilters = filters.query !== '' || 
    filters.location !== 'all' || 
    filters.type !== 'all' || 
    filters.capacity !== 'all' || 
    filters.priceRange !== 'all' || 
    filters.checkInDate !== '' || 
    filters.checkOutDate !== '';

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilter = (key: keyof SearchFilters) => {
    const resetValue = key === 'query' || key === 'checkInDate' || key === 'checkOutDate' ? '' : 'all';
    setFilters({ ...filters, [key]: resetValue });
    if (key === 'checkInDate') setCheckInDate(undefined);
    if (key === 'checkOutDate') setCheckOutDate(undefined);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="공간명, 지역, 키워드로 검색..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              검색
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">체크인 날짜</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? `${checkInDate.getMonth() + 1}월 ${checkInDate.getDate()}일` : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={(date) => handleDateChange('checkIn', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">체크아웃 날짜</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? `${checkOutDate.getMonth() + 1}월 ${checkOutDate.getDate()}일` : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={(date) => handleDateChange('checkOut', date)}
                        disabled={(date) => date < (checkInDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">지역</label>
                  <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">공간 유형</label>
                  <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {spaceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">수용 인원</label>
                  <Select value={filters.capacity} onValueChange={(value) => updateFilter('capacity', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {capacityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">가격대</label>
                  <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">활성 필터:</span>
              {filters.query && (
                <Badge variant="secondary" className="gap-1">
                  {filters.query}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('query')}
                  />
                </Badge>
              )}
              {filters.location !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {locations.find(l => l.value === filters.location)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('location')}
                  />
                </Badge>
              )}
              {filters.type !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {spaceTypes.find(t => t.value === filters.type)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('type')}
                  />
                </Badge>
              )}
              {filters.capacity !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {capacityOptions.find(c => c.value === filters.capacity)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('capacity')}
                  />
                </Badge>
              )}
              {filters.priceRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {priceRanges.find(p => p.value === filters.priceRange)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('priceRange')}
                  />
                </Badge>
              )}
              {filters.checkInDate && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  체크인: {new Date(filters.checkInDate).getMonth() + 1}/{new Date(filters.checkInDate).getDate()}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('checkInDate')}
                  />
                </Badge>
              )}
              {filters.checkOutDate && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  체크아웃: {new Date(filters.checkOutDate).getMonth() + 1}/{new Date(filters.checkOutDate).getDate()}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => resetFilter('checkOutDate')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClear}>
                모든 필터 지우기
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}