
'use client';
/**
 * @file OfflinePaymentPage
 * @description This page provides a step-by-step interface for members to make in-store payments and redeem coupons using a QR code.
 *
 * @overview
 * The OfflinePaymentPage guides the user through a multi-stage process to complete a transaction at a physical merchant location.
 * The process begins with scanning a merchant's QR code or entering their ID manually, followed by applying an available coupon,
 * and finally confirming the payment. The page manages the state for the entire flow.
 *
 * @features
 * - **Multi-Stage Process**: Guides the user through 'Details', 'Apply Coupons', 'Confirmation', and 'Completed' stages.
 * - **QR Code Scanner**: Integrates `html5-qrcode` to provide a camera-based QR code scanning experience.
 *   - Includes permission checks and user-friendly error handling for camera access.
 * - **Manual Entry**: Allows users to manually type in a merchant code if they cannot or prefer not to use the QR scanner.
 * - **Live Data Integration**:
 *   - Verifies the merchant code against the live database of merchants.
 *   - Fetches the user's actual, available coupons from Firestore.
 * - **Dynamic Calculation**: Calculates the final bill amount in real-time as coupons are selected or deselected, handling both fixed and percentage discounts.
 * - **Confirmation Screen**: Presents a clear summary of the transaction—including bill amount, coupon applied, discount, and final total—before the user confirms payment.
 * - **State Management**: Uses React state to manage the current stage, user inputs, and fetched data throughout the process.
 */
import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Ticket,
  CheckCircle,
  IndianRupee,
  Loader2,
  AlertCircle,
  Camera,
  X,
  Smartphone
} from 'lucide-react';
import type { UserCoupon, Merchant, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@/lib/auth';
import { getMerchantsClient } from '@/services/merchant-service.client';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

const STAGES = {
  INPUT_DETAILS: 'INPUT_DETAILS',
  APPLY_COUPONS: 'APPLY_COUPONS',
  CONFIRMATION: 'CONFIRMATION',
  COMPLETED: 'COMPLETED',
};

const QR_SCANNER_ID = "qr-scanner-region";

const QrScanner = ({ onScanSuccess, onScanFailure, onClose }: { onScanSuccess: (decodedText: string) => void; onScanFailure: (error: string) => void; onClose: () => void; }) => {
    const [scanner, setScanner] = React.useState<Html5Qrcode | null>(null);
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const qrScanner = new Html5Qrcode(QR_SCANNER_ID, {
            verbose: false
        });
        setScanner(qrScanner);

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setHasPermission(true);
            } else {
                setHasPermission(false);
                onScanFailure("No camera devices found.");
            }
        }).catch(err => {
            setHasPermission(false);
            onScanFailure("Camera access denied. Please enable camera permissions in your browser settings.");
        });

        return () => {
            if (qrScanner.isScanning) {
                qrScanner.stop().catch(err => console.error("Failed to stop scanner on cleanup:", err));
            }
        };
    }, [onScanFailure]);

    React.useEffect(() => {
        if (scanner && hasPermission === true) {
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 }, },
                (decodedText, decodedResult) => {
                    if (scanner.isScanning) {
                        scanner.stop().then(() => {
                            onScanSuccess(decodedText);
                        }).catch(err => console.error("Error stopping scanner after success:", err));
                    }
                },
                (errorMessage) => { /* ignore, this callback is for scan failures */ }
            ).catch(err => {
                onScanFailure(err.message || "Failed to start QR scanner.");
            });
        }
    }, [scanner, hasPermission, onScanSuccess, onScanFailure]);

    return (
        <div className="w-full flex flex-col items-center gap-4">
             {hasPermission === null && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            <div id={QR_SCANNER_ID} className={cn("w-full border-2 border-dashed rounded-lg overflow-hidden", hasPermission !== true && 'hidden')} />
             {hasPermission === false && (
                  <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Camera Error</AlertTitle>
                      <AlertDescription>
                          Could not access camera. Please ensure permissions are granted and try again.
                      </AlertDescription>
                  </Alert>
              )}
             <Button variant="outline" className="w-full" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel Scan
            </Button>
        </div>
    );
};

export default function OfflinePaymentPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [stage, setStage] = React.useState(STAGES.INPUT_DETAILS);
  const [merchantCode, setMerchantCode] = React.useState('');
  const [billAmount, setBillAmount] = React.useState('');
  const [merchant, setMerchant] = React.useState<Merchant | null>(null);
  const [availableCoupons, setAvailableCoupons] = React.useState<UserCoupon[]>([]);
  
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [selectedCoupon, setSelectedCoupon] = React.useState<UserCoupon | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [phonepeOrderId, setPhonepeOrderId] = React.useState<string | null>(null);
  const [isPolling, setIsPolling] = React.useState(false);
  
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  // Poll for PhonePe payment result when returning from gateway (?payment=phonepe or txn in URL / sessionStorage)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const txn = params.get('txn') || params.get('merchantOrderId') || sessionStorage.getItem('phonepe_merchantOrderId');
    if (params.get('payment') === 'phonepe' && txn) {
      sessionStorage.removeItem('phonepe_merchantOrderId');
      setPhonepeOrderId(txn);
      setIsPolling(true);
    }
  }, []);

  React.useEffect(() => {
    if (!phonepeOrderId || !isPolling) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/phonepe/status?merchantOrderId=${encodeURIComponent(phonepeOrderId)}`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setIsPolling(false);
          setPhonepeOrderId(null);
          setStage(STAGES.COMPLETED);
          window.history.replaceState({}, '', window.location.pathname);
        } else if (data.status === 'FAILED') {
          setIsPolling(false);
          setPhonepeOrderId(null);
          toast({ variant: 'destructive', title: 'Payment failed', description: data.errorCode || 'Payment was not completed.' });
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch {
        // keep polling
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [phonepeOrderId, isPolling, toast]);

  React.useEffect(() => {
      const fetchCoupons = async () => {
          if (!authUser) return;
          if (!isFirebaseConfigured) {
              setAvailableCoupons([]);
              return;
          }
          const couponsCol = collection(db, 'userCoupons');
          const q = query(couponsCol, where('userId', '==', authUser.uid), where('status', '==', 'active'));
          const snapshot = await getDocs(q);
          const now = new Date();
          const coupons = snapshot.docs.map(doc => {
               const data = doc.data();
               return {
                   ...data,
                   userCouponId: doc.id,
                   expiryDate: (data.expiryDate as Timestamp).toDate()
               } as UserCoupon;
          }).filter(c => c.expiryDate > now);
          setAvailableCoupons(coupons);
      }
      fetchCoupons();
  }, [authUser]);

  const handleVerifyMerchant = async () => {
    setIsVerifying(true);
    try {
        const allMerchants = await getMerchantsClient();
        const foundMerchant = allMerchants.find(m => m.merchantId === merchantCode);
        if (foundMerchant) {
            setMerchant(foundMerchant);
            setStage(STAGES.APPLY_COUPONS);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Merchant',
                description: 'No merchant found with that code. Please try again.'
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'Could not connect to the server to verify the merchant.'
        });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStage(STAGES.COMPLETED);
      setIsProcessing(false);
    }, 1500);
  };

  const handlePayViaPhonePe = async () => {
    if (!authUser || !merchant || finalAmount < 100) {
      toast({ variant: 'destructive', title: 'Cannot pay', description: 'Amount must be at least ₹1 and you must be signed in.' });
      return;
    }
    setIsCreatingPayment(true);
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${base}/member/offline-payment?payment=phonepe`;
      const res = await fetch('/api/payment/phonepe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: finalAmount,
          userId: authUser.uid,
          merchantId: merchant.merchantId,
          redirectUrl,
          callbackUrl: redirectUrl,
          notes: `Payment at ${merchant.name}`,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ variant: 'destructive', title: 'Payment link failed', description: data.error || 'Could not create payment.' });
        return;
      }
      const url = data.intentUrl || data.redirectUrl;
      if (url && data.merchantOrderId) {
        sessionStorage.setItem('phonepe_merchantOrderId', data.merchantOrderId);
        setPhonepeOrderId(data.merchantOrderId);
        setIsPolling(true);
        window.location.href = url;
      } else {
        toast({ variant: 'destructive', title: 'No payment URL', description: 'PhonePe did not return a payment link.' });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Could not start payment.' });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleQrScanSuccess = (decodedText: string) => {
    setMerchantCode(decodedText);
    setIsScannerOpen(false);
    toast({
        title: 'QR Code Scanned!',
        description: `Merchant code has been entered.`
    });
  }

  const handleQrScanFailure = (error: string) => {
    setIsScannerOpen(false);
    toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error
    });
  }

  const billInPaise = Math.round(Number(billAmount) * 100);
  const discountValue = selectedCoupon?.discountValue || 0;
  
  let discountAmount = 0;
  if (selectedCoupon) {
      if (selectedCoupon.discountType === 'fixed') {
          discountAmount = Math.min(discountValue, billInPaise);
      } else { // percentage
          discountAmount = Math.round(billInPaise * (discountValue / 100));
      }
  }
  
  const finalAmount = billInPaise - discountAmount;

  const renderContent = () => {
    if (isPolling && phonepeOrderId) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-medium">Verifying your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait. Do not close this page.</p>
          </CardContent>
        </Card>
      );
    }
    if (isScannerOpen) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Scan Merchant QR Code</CardTitle>
            <CardDescription>Point your camera at the QR code displayed at the counter.</CardDescription>
          </CardHeader>
          <CardContent>
              <QrScanner onScanSuccess={handleQrScanSuccess} onScanFailure={handleQrScanFailure} onClose={() => setIsScannerOpen(false)} />
          </CardContent>
        </Card>
      );
    }
    
    switch (stage) {
      case STAGES.INPUT_DETAILS:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Offline Redemption</CardTitle>
              <CardDescription>
                Enter the merchant's code and your total bill amount to begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant-code">Merchant Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="merchant-code"
                    placeholder="Enter code manually"
                    value={merchantCode}
                    onChange={(e) => setMerchantCode(e.target.value)}
                  />
                  <Button variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                    <Camera className="h-4 w-4"/>
                    <span className="sr-only">Scan QR Code</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Total Bill Amount (₹)</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  placeholder="e.g., 500"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleVerifyMerchant}
                disabled={!merchantCode || !billAmount || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Proceed to Apply Coupons
              </Button>
            </CardFooter>
          </Card>
        );
      case STAGES.APPLY_COUPONS:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Apply a Coupon</CardTitle>
              <CardDescription>
                Select one available coupon to apply to your bill of ₹{billAmount} at {merchant?.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {availableCoupons.length > 0 ? availableCoupons.map((coupon) => (
                  <button
                    key={coupon.userCouponId}
                    onClick={() =>
                      setSelectedCoupon(
                        selectedCoupon?.userCouponId === coupon.userCouponId
                          ? null
                          : coupon
                      )
                    }
                    className={cn(
                      'w-full text-left p-3 border rounded-lg flex items-center gap-3 transition-all',
                      selectedCoupon?.userCouponId === coupon.userCouponId
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{coupon.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: {coupon.discountType === 'fixed' ? `₹${(coupon.discountValue / 100).toFixed(2)}` : `${coupon.discountValue}%`} | Expires: {coupon.expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                )) : <p className="text-center text-muted-foreground py-4">No coupons available.</p>}
              </div>
               <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Discount Applied: ₹{(discountAmount / 100).toFixed(2)}</AlertTitle>
                  <AlertDescription>
                    The final amount you need to pay is ₹{(finalAmount / 100).toFixed(2)}.
                  </AlertDescription>
                </Alert>
            </CardContent>
             <CardFooter>
              <Button onClick={() => setStage(STAGES.CONFIRMATION)} className="w-full">
                 <ArrowRight className="mr-2 h-4 w-4" />
                 Review & Confirm
              </Button>
            </CardFooter>
          </Card>
        );
      case STAGES.CONFIRMATION:
         return (
             <Card>
                <CardHeader>
                    <CardTitle>Confirm Redemption</CardTitle>
                    <CardDescription>Please review the details below before completing the transaction.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Merchant:</span>
                            <span className="font-bold">{merchant?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Bill:</span>
                            <span className="font-medium">₹{(billInPaise / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600">
                            <span className="text-muted-foreground">Coupon Applied:</span>
                            <span className="font-medium">{selectedCoupon?.title || 'None'}</span>
                        </div>
                         <div className="flex justify-between items-center text-red-600">
                            <span className="text-muted-foreground">Discount:</span>
                            <span className="font-medium">- ₹{(discountAmount / 100).toFixed(2)}</span>
                        </div>
                        <div className="border-t my-2"></div>
                         <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">Final Amount to Pay:</span>
                            <span className="font-bold text-primary">₹{(finalAmount / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button variant="outline" onClick={() => setStage(STAGES.APPLY_COUPONS)} className="w-full sm:w-auto">Back</Button>
                      <Button onClick={handlePayViaPhonePe} disabled={isCreatingPayment || finalAmount < 100} className="w-full sm:flex-1">
                        {isCreatingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
                        Pay via UPI / PhonePe
                      </Button>
                    </div>
                    <Button variant="secondary" onClick={handleProcessPayment} disabled={isProcessing} className="w-full">
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Mark as paid (demo)
                    </Button>
                </CardFooter>
             </Card>
         )
      case STAGES.COMPLETED:
        return (
             <Card>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-16">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                    <h2 className="text-2xl font-semibold">Redemption Successful!</h2>
                    <p className="text-muted-foreground max-w-sm">
                        You have paid ₹{(finalAmount / 100).toFixed(2)} to {merchant?.name}. A notification has been sent to the merchant.
                    </p>
                    <Button onClick={() => {
                        setStage(STAGES.INPUT_DETAILS);
                        setMerchantCode('');
                        setBillAmount('');
                        setSelectedCoupon(null);
                    }}>
                        Start New Redemption
                    </Button>
                </CardContent>
             </Card>
        )
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Redeem Coupon" />
      <div className="max-w-2xl mx-auto w-full">
          {renderContent()}
      </div>
    </main>
  );
}
