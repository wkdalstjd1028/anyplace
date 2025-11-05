import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { SocialLoginButtons } from './SocialLoginButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">anyplace에 오신 것을 환영합니다</DialogTitle>
          <DialogDescription className="text-center">
            소셜 로그인으로 간편하게 시작하세요
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <SocialLoginButtons onSocialLogin={onLogin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}