import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { CreditCard, Smartphone, Building2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentModalProps {
  bookingData: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
}

const paymentMethods = [
  {
    id: 'card',
    name: '신용/체크카드',
    icon: CreditCard,
    description: '국내외 모든 카드 사용 가능'
  },
  {
    id: 'toss',
    name: '토스페이',
    icon: Smartphone,
    description: '간편하고 안전한 결제'
  },
  {
    id: 'portone',
    name: '포트원',
    icon: Building2,
    description: '통합 결제 시스템'
  }
];

export function PaymentModal({ bookingData, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Don't render if no booking data
  if (!bookingData) {
    return null;
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate payment processing
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      
      const paymentData = {
        id: `payment_${Date.now()}`,
        bookingId: `booking_${Date.now()}`,
        method: selectedMethod,
        amount: bookingData?.totalAmount || 0,
        status: 'completed',
        paymentDate: new Date(),
        transactionId: `txn_${Date.now()}`
      };

      onSuccess(paymentData);
      toast.success('결제가 완료되었습니다!');
    }, 2500);
  };

  if (isProcessing) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>결제 처리 중</DialogTitle>
            <DialogDescription>결제가 진행 중입니다</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">결제 처리 중...</h3>
            <p className="text-muted-foreground mb-4">잠시만 기다려주세요</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% 완료</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>결제</DialogTitle>
          <DialogDescription>
            예약 정보를 확인하고 결제 방법을 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">예약 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>공간명</span>
                <span className="font-medium">{bookingData?.spaceName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>날짜</span>
                <span>{bookingData?.date?.toLocaleDateString('ko-KR') || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>시간</span>
                <span>{bookingData?.startTime || '-'} - {bookingData?.endTime || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>이용 시간</span>
                <span>{bookingData?.duration || 0}시간</span>
              </div>
              <div className="flex justify-between">
                <span>인원</span>
                <span>{bookingData?.headCount || 0}명</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>총 결제 금액</span>
                <span>{bookingData?.totalAmount?.toLocaleString() || '0'}원</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-4">결제 방법 선택</h3>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <IconComponent className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Security Notice */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">안전한 결제</span>
              </div>
              <p className="text-sm text-muted-foreground">
                모든 결제는 SSL 암호화로 보호되며, 개인정보는 안전하게 처리됩니다.
              </p>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 예약 확정 후 취소 시 취소 수수료가 발생할 수 있습니다.</p>
            <p>• 결제 완료 후 예약 확인서가 이메일로 발송됩니다.</p>
            <p>• 이용 규칙을 준수하지 않을 경우 이용이 제한될 수 있습니다.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handlePayment} className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              {bookingData?.totalAmount?.toLocaleString() || '0'}원 결제
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}