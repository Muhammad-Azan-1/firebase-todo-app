"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import SendOtp from './SendOtp';
import VerifyOtp from './VerifyOtp';
import CompleteProfile from './CompleteProfile';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store/store';
import { sendOtp } from '@/redux/actions/authActions';

// Steps: 1 = SendOtp, 2 = VerifyOtp, 3 = CompleteProfile
type Step = 'send' | 'verify' | 'complete';

const PhoneAuth = () => {

  const params = useSearchParams()
  const redirect = params.get("redirect") || '/'
  const dispatch = useDispatch<AppDispatch>()

  // LocalStorage keys
  const PHONE_KEY = "phoneAuthPhone";
  const OTP_SENT_KEY = "phoneAuthOtpSent";
  const COOLDOWN_KEY = "phoneOtpCooldownEnd";
  const NEW_USER_KEY = "phoneAuthNewUser";
  const UID_KEY = "phoneAuthUid";

  // Current step - persisted
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (typeof window === "undefined") return 'send';
    // Check if user is on complete profile step
    if (localStorage.getItem(NEW_USER_KEY) === 'true') return 'complete';
    // Check if OTP was sent
    if (localStorage.getItem(OTP_SENT_KEY) === 'true') return 'verify';
    return 'send';
  });

  // Phone number state - persisted
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (typeof window === "undefined") return '';
    return localStorage.getItem(PHONE_KEY) || '';
  })

  // New user data for complete profile step
  const [newUserUid, setNewUserUid] = useState(() => {
    if (typeof window === "undefined") return '';
    return localStorage.getItem(UID_KEY) || '';
  });

  // Cooldown timer for resending OTP
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const end = localStorage.getItem(COOLDOWN_KEY);
    return end ? Math.max(0, Math.ceil((+end - Date.now()) / 1000)) : 0;
  });

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }, [cooldownSeconds]);

  // Helper to set cooldown
  const startCooldown = (seconds: number) => {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000));
    setCooldownSeconds(seconds);
  };

  // Move to OTP verification step
  const handleOtpSent = () => {
    setCurrentStep('verify');
    localStorage.setItem(OTP_SENT_KEY, 'true');
    localStorage.setItem(PHONE_KEY, phoneNumber);
  };

  // Go back to phone input step
  const handleChangePhone = () => {
    setCurrentStep('send');
    localStorage.removeItem(OTP_SENT_KEY);
    localStorage.removeItem(NEW_USER_KEY);
    localStorage.removeItem(UID_KEY);
  };

  // Handle new user - go to complete profile
  const handleNewUser = (uid: string, userPhone: string) => {
    setNewUserUid(uid);
    setPhoneNumber(userPhone);
    setCurrentStep('complete');
    localStorage.setItem(NEW_USER_KEY, 'true');
    localStorage.setItem(UID_KEY, uid);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const result = await dispatch(sendOtp(phoneNumber));
      if (result.success) {
        startCooldown(60);
      }
    } catch (error) {
      // console.error("Error resending OTP:", error);
    }
  };

  // Get header text based on step
  const getHeaderText = () => {
    switch (currentStep) {
      case 'send':
        return { title: "Sign in with Phone", subtitle: "Enter your phone number to receive an OTP" };
      case 'verify':
        return { title: "Verify OTP", subtitle: `Enter the 6-digit code sent to ${phoneNumber}` };
      case 'complete':
        return { title: "Complete Your Profile", subtitle: "Just a few more details to get started" };
    }
  };

  const header = getHeaderText();

  return (
    <>
      <div className="max-w-md w-full h-auto mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">

        {/* Header */}
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {header.title}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {header.subtitle}
        </p>

        {/* Step 1: Send OTP */}
        {currentStep === 'send' && (
          <SendOtp
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onOtpSent={handleOtpSent}
            cooldownSeconds={cooldownSeconds}
            startCooldown={startCooldown}
          />
        )}

        {/* Step 2: Verify OTP */}
        {currentStep === 'verify' && (
          <VerifyOtp
            phoneNumber={phoneNumber}
            redirect={redirect}
            onChangePhone={handleChangePhone}
            onResendOtp={handleResendOtp}
            onNewUser={handleNewUser}
            cooldownSeconds={cooldownSeconds}
          />
        )}

        {/* Step 3: Complete Profile (new users only) */}
        {currentStep === 'complete' && (
          <CompleteProfile
            uid={newUserUid}
            phoneNumber={phoneNumber}
            redirect={redirect}
          />
        )}

        {/* Invisible reCAPTCHA container - REQUIRED */}
        <div id="recaptcha-container"></div>

      </div>
    </>
  )
}

export default PhoneAuth;