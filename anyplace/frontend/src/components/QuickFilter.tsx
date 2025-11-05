import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent } from './ui/card';
import { CalendarIcon, MapPin, Users, Building2, Search } from 'lucide-react';

interface QuickFilterProps {
  onSearch: (filters: {
    date: string;
    province: string;
    district: string;
    capacity: number;
    spaceType: string;
  }) => void;
}

const provinces = [
  { value: 'all', label: '전체 지역' },
  { value: '서울', label: '서울특별시' },
  { value: '부산', label: '부산광역시' },
  { value: '대구', label: '대구광역시' },
  { value: '인천', label: '인천광역시' },
  { value: '광주', label: '광주광역시' },
  { value: '대전', label: '대전광역시' },
  { value: '울산', label: '울산광역시' },
  { value: '세종', label: '세종특별자치시' },
  { value: '경기', label: '경기도' },
  { value: '충남', label: '충청남도' },
  { value: '충북', label: '충청북도' },
  { value: '경남', label: '경상남도' },
  { value: '경북', label: '경상북도' },
  { value: '전남', label: '전라남도' },
  { value: '전북', label: '전북특별자치도' },
  { value: '제주', label: '제주특별자치도' }
];

const districts = {
  서울: [
    { value: '강남구', label: '강남구' },
    { value: '서초구', label: '서초구' },
    { value: '마포구', label: '마포구' },
    { value: '종로구', label: '종로구' },
    { value: '용산구', label: '용산구' },
    { value: '성동구', label: '성동구' },
    { value: '영등포구', label: '영등포구' },
    { value: '강북구', label: '강북구' },
    { value: '노원구', label: '노원구' },
    { value: '송파구', label: '송파구' },
    { value: '강서구', label: '강서구' },
    { value: '관악구', label: '관악구' }
  ],
  부산: [
    { value: '해운대구', label: '해운대구' },
    { value: '부산진구', label: '부산진구' },
    { value: '동래구', label: '동래구' },
    { value: '남구', label: '남구' },
    { value: '중구', label: '중구' },
    { value: '서구', label: '서구' },
    { value: '사하구', label: '사하구' },
    { value: '금정구', label: '금정구' },
    { value: '강서구', label: '강서구' },
    { value: '연제구', label: '연제구' },
    { value: '수영구', label: '수영구' },
    { value: '사상구', label: '사상구' }
  ],
  대구: [
    { value: '중구', label: '중구' },
    { value: '동구', label: '동구' },
    { value: '서구', label: '서구' },
    { value: '남구', label: '남구' },
    { value: '북구', label: '북구' },
    { value: '수성구', label: '수성구' },
    { value: '달서구', label: '달서구' },
    { value: '달성군', label: '달성군' },
    { value: '군위군', label: '군위군' }
  ],
  광주: [
    { value: '동구', label: '동구' },
    { value: '서구', label: '서구' },
    { value: '남구', label: '남구' },
    { value: '북구', label: '북구' },
    { value: '광산구', label: '광산구' }
  ],
  대전: [
    { value: '동구', label: '동구' },
    { value: '중구', label: '중구' },
    { value: '서구', label: '서구' },
    { value: '유성구', label: '유성구' },
    { value: '대덕구', label: '대덕구' }
  ],
  울산: [
    { value: '중구', label: '중구' },
    { value: '남구', label: '남구' },
    { value: '동구', label: '동구' },
    { value: '북구', label: '북구' },
    { value: '울주군', label: '울주군' }
  ],
  세종: [
    { value: '세종시', label: '세종시' }
  ],
  인천: [
    { value: '중구', label: '중구' },
    { value: '동구', label: '동구' },
    { value: '미추홀구', label: '미추홀구' },
    { value: '연수구', label: '연수구' },
    { value: '남동구', label: '남동구' },
    { value: '부평구', label: '부평구' },
    { value: '계양구', label: '계양구' },
    { value: '서구', label: '서구' }
  ],
  경기: [
    { value: '수원시', label: '수원시' },
    { value: '성남시', label: '성남시' },
    { value: '고양시', label: '고양시' },
    { value: '용인시', label: '용인시' },
    { value: '부천시', label: '부천시' },
    { value: '안산시', label: '안산시' },
    { value: '안양시', label: '안양시' },
    { value: '남양주시', label: '남양주시' },
    { value: '화성시', label: '화성시' },
    { value: '평택시', label: '평택시' }
  ],
  충남: [
    { value: '천안시', label: '천안시' },
    { value: '공주시', label: '공주시' },
    { value: '보령시', label: '보령시' },
    { value: '아산시', label: '아산시' },
    { value: '서산시', label: '서산시' },
    { value: '논산시', label: '논산시' },
    { value: '계룡시', label: '계룡시' },
    { value: '당진시', label: '당진시' }
  ],
  충북: [
    { value: '청주시', label: '청주시' },
    { value: '충주시', label: '충주시' },
    { value: '제천시', label: '제천시' },
    { value: '보은군', label: '보은군' },
    { value: '옥천군', label: '옥천군' },
    { value: '영동군', label: '영동군' },
    { value: '증평군', label: '증평군' },
    { value: '진천군', label: '진천군' }
  ],
  경남: [
    { value: '창원시', label: '창원시' },
    { value: '진주시', label: '진주시' },
    { value: '통영시', label: '통영시' },
    { value: '사천시', label: '사천시' },
    { value: '김해시', label: '김해시' },
    { value: '밀양시', label: '밀양시' },
    { value: '거제시', label: '거제시' },
    { value: '양산시', label: '양산시' }
  ],
  경북: [
    { value: '포항시', label: '포항시' },
    { value: '경주시', label: '경주시' },
    { value: '김천시', label: '김천시' },
    { value: '안동시', label: '안동시' },
    { value: '구미시', label: '구미시' },
    { value: '영주시', label: '영주시' },
    { value: '영천시', label: '영천시' },
    { value: '상주시', label: '상주시' }
  ],
  전남: [
    { value: '목포시', label: '목포시' },
    { value: '여수시', label: '여수시' },
    { value: '순천시', label: '순천시' },
    { value: '나주시', label: '나주시' },
    { value: '광양시', label: '광양시' },
    { value: '담양군', label: '담양군' },
    { value: '곡성군', label: '곡성군' },
    { value: '구례군', label: '구례군' }
  ],
  전북: [
    { value: '전주시', label: '전주시' },
    { value: '군산시', label: '군산시' },
    { value: '익산시', label: '익산시' },
    { value: '정읍시', label: '정읍시' },
    { value: '남원시', label: '남원시' },
    { value: '김제시', label: '김제시' },
    { value: '완주군', label: '완주군' },
    { value: '진안군', label: '진안군' }
  ],
  제주: [
    { value: '제주시', label: '제주시' },
    { value: '서귀포시', label: '서귀포시' }
  ]
};

const spaceTypes = [
  { value: 'all', label: '전체 공간' },
  { value: '회의실', label: '회의실' },
  { value: '파티룸', label: '파티룸' },
  { value: '녹음실', label: '녹음실' },
  { value: '스튜디오', label: '스튜디오' },
  { value: '연습실', label: '연습실' },
  { value: '세미나실', label: '세미나실' },
  { value: '코워킹스페이스', label: '코워킹스페이스' },
  { value: '이벤트홀', label: '이벤트홀' }
];

export const QuickFilter = React.memo(function QuickFilter({ onSearch }: QuickFilterProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [capacity, setCapacity] = useState('');
  const [spaceType, setSpaceType] = useState('all');

    useEffect(() => {
      setSelectedDistrict('all');
    }, [selectedProvince]);

    const handleSearch = useCallback(() => {
      onSearch({
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        province: selectedProvince === 'all' ? '' : selectedProvince,
        district: selectedDistrict === 'all' ? '' : selectedDistrict,
        capacity: capacity ? parseInt(capacity) : 0,
        spaceType: spaceType === 'all' ? '' : spaceType
      });
    }, [selectedDate, selectedDistrict, selectedProvince, capacity, spaceType, onSearch]);

    const handleReset = useCallback(() => {
      setSelectedDate(undefined);
      setSelectedProvince('all');
      setSelectedDistrict('all');
      setCapacity('');
      setSpaceType('all');
    }, []);

    const availableDistricts = useMemo(() =>
      selectedProvince === 'all' ? [] : (districts[selectedProvince as keyof typeof districts] || []),
      [selectedProvince]
    );

    return (
      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                날짜
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-11"
                  >
                    {selectedDate ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일` : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Province Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                시/도
              </label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="시/도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                구/시
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={selectedProvince === 'all'}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={selectedProvince === 'all' ? '시/도를 먼저 선택하세요' : '구/시 선택'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 구/시</SelectItem>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district.value} value={district.value}>
                      {district.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                인원 수
              </label>
              <Input
                type="number"
                placeholder="인원 수"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                className="h-11"
              />
            </div>

            {/* Space Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                공간 종류
              </label>
              <Select value={spaceType} onValueChange={setSpaceType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="공간 선택" />
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

            {/* Search Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 h-11">
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-11 px-3"
              >
                초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
});