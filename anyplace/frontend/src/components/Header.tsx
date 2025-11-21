import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { User, LogOut, Settings, Building, Calendar, Home, Heart } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onToggleHostMode: () => void;
  isHost: boolean;
  onNavigate: (view: string) => void;
  onResetToHome: () => void;
  currentView: string;
}

export const Header = React.memo(function Header({ user, onLogin, onLogout, onToggleHostMode, isHost, onNavigate, onResetToHome, currentView }: HeaderProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors" 
            onClick={onResetToHome}
          >
            anyplace
          </h1>
          {user && (
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => onNavigate('home')}
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  currentView === 'home' ? 'font-medium text-foreground' : ''
                }`}
              >
                <Home className="w-4 h-4 inline mr-1" />
                {isHost ? '내 공간' : '공간 찾기'}
              </button>
              {!isHost && (
                <button 
                  onClick={() => onNavigate('favorites')}
                  className={`text-foreground/80 hover:text-foreground transition-colors ${
                    currentView === 'favorites' ? 'font-medium text-foreground' : ''
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-1" />
                  찜한 공간
                </button>
              )}
              <button 
                onClick={() => onNavigate('reservations')}
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  currentView === 'reservations' ? 'font-medium text-foreground' : ''
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                {isHost ? '예약 관리' : '내 예약'}
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Badge variant={isHost ? "default" : "secondary"}>
                  {isHost ? "호스트" : "게스트"}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onToggleHostMode}
                >
                  <Building className="w-4 h-4 mr-2" />
                  {isHost ? "게스트 모드" : "호스트 되기"}
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                공간을 예약하고 관리하려면
              </span>
              <Button onClick={onLogin} className="px-6">
                로그인
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});