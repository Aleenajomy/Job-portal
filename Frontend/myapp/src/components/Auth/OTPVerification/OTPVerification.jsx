import React, { useState, useEffect, useRef } from 'react';

const OTPVerification = ({ email, onVerifySuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // API call to verify OTP
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerifySuccess();
        }, 1500);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimer(300);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setSuccess('OTP sent successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="form-container otp-active">
      <div style={{textAlign: 'center', padding: '20px 0'}}>
        <h2 style={{fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0'}}>
          Verify Your Email
        </h2>
        <p style={{fontSize: '14px', color: '#666', margin: '0 0 24px 0', lineHeight: '1.5'}}>
          We've sent a 6-digit code to <span style={{color: '#0891b2', fontWeight: '600'}}>{email}</span>
        </p>

        <div style={{display: 'flex', justifyContent: 'center', gap: '12px', margin: '24px 0'}}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: '48px',
                height: '48px',
                border: `2px solid ${error ? '#ef4444' : digit ? '#0891b2' : '#e5e7eb'}`,
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a1a',
                background: error ? '#fef2f2' : digit ? '#f0fdff' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          ))}
        </div>

        {timer > 0 ? (
          <div style={{fontSize: '14px', color: '#666', margin: '16px 0'}}>
            Code expires in {formatTime(timer)}
          </div>
        ) : (
          <div style={{fontSize: '14px', color: '#ef4444', margin: '16px 0'}}>
            Code expired
          </div>
        )}

        <button
          onClick={handleResendOTP}
          disabled={!canResend}
          style={{
            background: 'none',
            border: 'none',
            color: canResend ? '#0891b2' : '#9ca3af',
            fontSize: '14px',
            fontWeight: '600',
            cursor: canResend ? 'pointer' : 'not-allowed',
            textDecoration: canResend ? 'underline' : 'none',
            margin: '8px 0'
          }}
        >
          {canResend ? 'Resend Code' : 'Resend Code'}
        </button>

        <button
          onClick={handleVerifyOTP}
          disabled={isVerifying || otp.join('').length !== 6}
          className="primary-btn"
          style={{marginTop: '20px'}}
        >
          {isVerifying ? 'Verifying...' : 'Verify Email'}
        </button>

        {error && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '8px'}}>{error}</div>}
        {success && <div style={{color: '#10b981', fontSize: '12px', marginTop: '8px'}}>{success}</div>}
      </div>
    </div>
  );
};

export default OTPVerification;