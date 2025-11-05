import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'google' | 'kakao' | 'naver') => void;
}

const GoogleIcon = () => <span style={{ marginRight: '8px', fontSize: '1.2em' }}>G</span>;
const KakaoIcon = () => <span style={{ marginRight: '8px', fontSize: '1.2em' }}>K</span>;
const NaverIcon = () => <span style={{ marginRight: '8px', fontSize: '1.2em' }}>N</span>;

export const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            anyplace에 오신 것을 환영합니다
          </DialogTitle>
          <DialogDescription>
            소셜 로그인으로 간편하게 시작하세요
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={() => onLogin('google')}
          >
            <GoogleIcon /> Google로 계속하기
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={() => onLogin('kakao')}
          >
            <KakaoIcon /> 카카오로 계속하기
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={() => onLogin('naver')}
          >
            <NaverIcon /> 네이버로 계속하기
          </Button>
        </div>
        <p className="px-8 text-center text-xs text-muted-foreground">
          로그인하시면 anyplace의{' '}
          <a href="#" className="underline hover:text-primary">
            이용약관
          </a>{' '}
          및{' '}
          <a href="#" className="underline hover:text-primary">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </DialogContent>
    </Dialog>
  );
};