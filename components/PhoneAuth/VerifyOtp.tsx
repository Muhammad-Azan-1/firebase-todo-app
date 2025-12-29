"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { LabelInputContainer, BottomGradient } from "@/components/ui/signup-form-demo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppDispatch } from '@/redux/store/store'
import { verifyOtp } from '@/redux/actions/authActions'
import { useRouter } from 'next/navigation';
import { IconRefresh, IconAlertCircle, IconX } from "@tabler/icons-react";

interface VerifyOtpProps {
    phoneNumber: string;
    redirect: string;
    onChangePhone: () => void;
    onResendOtp: () => void;
    onNewUser: (uid: string, phoneNumber: string) => void;
    cooldownSeconds: number;
}

const VerifyOtp = ({
    phoneNumber,
    redirect,
    onChangePhone,
    onResendOtp,
    onNewUser,
    cooldownSeconds
}: VerifyOtpProps) => {

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const [otpCode, setOtpCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Handle Verify OTP using Redux action
    async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!otpCode.trim() || otpCode.length !== 6) {
            setErrorMessage("Please enter a valid 6-digit OTP code");
            return;
        }

        setIsVerifying(true);
        setErrorMessage(null);

        try {
            const result = await dispatch(verifyOtp(otpCode));

            if (result.success) {
                if (result.isNewUser) {
                    // New user - go to complete profile step
                    onNewUser(result.uid!, result.phoneNumber!);
                } else {
                    // Existing user - clear localStorage and redirect
                    localStorage.removeItem("phoneAuthPhone");
                    localStorage.removeItem("phoneAuthOtpSent");
                    localStorage.removeItem("phoneOtpCooldownEnd");
                    router.push(redirect);
                }
            } else {
                // Handle errors
                if (result.error === 'session-expired') {
                    setErrorMessage("Session expired. Please request a new OTP.");
                    onChangePhone();
                } else if (result.error === 'auth/invalid-verification-code') {
                    setErrorMessage("Invalid OTP code. Please check and try again.");
                } else if (result.error === 'auth/code-expired') {
                    setErrorMessage("OTP has expired. Please request a new one.");
                } else {
                    setErrorMessage("Verification failed. Please try again.");
                }
            }

        } catch (error: any) {
            // console.error("❌ Error verifying OTP:", error);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    }

    return (
        <form className="mt-8 mb-3" onSubmit={handleVerifyOtp}>
            <LabelInputContainer className="mb-4">
                <Label htmlFor="otp">We've sent a verification code to {phoneNumber}</Label>
                <Input
                    id="otp"
                    placeholder="Enter 6-digit code"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />

                {/* Error Message */}
                {errorMessage && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="cursor-pointer p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                            aria-label="Dismiss error"
                        >
                            <IconX className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </LabelInputContainer>

            {/* Verify Button */}
            <button
                className="cursor-pointer group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-br from-black to-neutral-600 px-4 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
            >
                {isVerifying ? (
                    <IconRefresh className="h-4 w-4 animate-spin" />
                ) : (
                    <span>Verify & Sign In</span>
                )}
                <BottomGradient />
            </button>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
                {cooldownSeconds > 0 ? (
                    <span className="text-sm text-neutral-500">
                        Resend OTP in {cooldownSeconds}s
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={onResendOtp}
                        className="text-sm text-blue-500 hover:underline cursor-pointer"
                    >
                        Resend OTP
                    </button>
                )}
            </div>

            {/* Change Phone Number */}
            <button
                type="button"
                onClick={onChangePhone}
                className="mt-2 cursor-pointer w-full text-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
                ← Change phone number
            </button>
        </form>
    )
}

export default VerifyOtp;
