import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { OTPInput } from '../components/OTPInput';
import { Loader2 } from 'lucide-react';
import { useToast, ToastContainer } from '../components/Toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, sendOTP } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      addToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      addToast('OTP sent successfully! (Use: 1234 for demo)', 'success');
      
      // Start resend timer
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      addToast('Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      const result = await login(phone, otp);
      if (result.success) {
        if (result.isNewUser) {
          navigate('/role-selection', { state: { phone } });
        } else {
          addToast('Login successful!', 'success');
          // Navigate based on user role (will be handled by App routing)
          navigate('/');
        }
      }
    } catch (error) {
      addToast('Invalid OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    handleSendOTP();
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍚</span>
            </div>
            <CardTitle>Welcome to AnnSetu</CardTitle>
            <CardDescription>
              Food Redistribution Platform - Login with your mobile number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={otpSent || loading}
                maxLength={10}
              />
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOTP}
                disabled={phone.length !== 10 || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-center block">Enter OTP</Label>
                  <OTPInput onComplete={handleVerifyOTP} disabled={loading} />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    OTP sent to +91 {phone}
                  </p>
                </div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <Button variant="link" onClick={handleResendOTP} disabled={loading}>
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>
            )}

            {loading && otpSent && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying OTP...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
