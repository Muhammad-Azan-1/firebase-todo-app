"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { LabelInputContainer, BottomGradient } from "@/components/ui/signup-form-demo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppDispatch } from '@/redux/store/store'
import { sendOtp } from '@/redux/actions/authActions'
import { IconRefresh, IconAlertCircle, IconX, IconPhone } from "@tabler/icons-react";

interface SendOtpProps {
    phoneNumber: string;
    setPhoneNumber: (value: string) => void;
    onOtpSent: () => void;
    cooldownSeconds: number;
    startCooldown: (seconds: number) => void;
}

const SendOtp = ({
    phoneNumber,
    setPhoneNumber,
    onOtpSent,
    cooldownSeconds,
    startCooldown
}: SendOtpProps) => {

    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    const dispatch = useDispatch<AppDispatch>()

    const [phoneError, setPhoneError] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Auto-dismiss success messages after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle Send OTP
    async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // Validate phone number
        if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber)) {
            setPhoneError(true);
            return;
        }

        if (isSending || cooldownSeconds > 0) return;

        setIsSending(true);
        setErrorMessage(null);
        setPhoneError(false);

        try {
            const result = await dispatch(sendOtp(phoneNumber));

            if (result.success) {
                setSuccessMessage("OTP sent successfully!");
                startCooldown(60);
                onOtpSent(); // Move to verify step
            } else {
                if (result.error?.includes('too-many-requests')) {
                    setErrorMessage("Too many requests. Please wait a few minutes before trying again.");
                    startCooldown(120);
                } else if (result.error?.includes('invalid-phone-number')) {
                    setErrorMessage("Invalid phone number format. Please use international format (e.g., +923001234567)");
                } else {
                    setErrorMessage(result.error || "Failed to send OTP. Please try again.");
                }
            }

        } catch (error: any) {
            // console.error("ERROR", error);
            setErrorMessage("Something went wrong. Please try again later.");
        } finally {
            setIsSending(false);
        }
    }

    const clearPhoneError = () => {
        if (phoneError) setPhoneError(false);
    };

    const isSendButtonDisabled = isSending || cooldownSeconds > 0;

    return (
        <form className="mt-8 mb-3" onSubmit={handleSendOtp}>
            <LabelInputContainer className="mb-4">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    placeholder="+923001234567"
                    type="tel"
                    value={phoneNumber}
                    className={`${phoneError ? 'animate-shake ring-2 ring-red-500' : ''}`}
                    onFocus={clearPhoneError}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-neutral-500 text-xs mt-1">
                    Include country code (e.g., +92 for Pakistan, +1 for USA)
                </p>

                {/* Phone validation error */}
                {phoneError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                        Please enter a valid phone number with country code (e.g., +923001234567)
                    </p>
                )}

                {/* General Error Message */}
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

            {/* Send OTP Button */}
            <button
                className="cursor-pointer group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-br from-black to-neutral-600 px-4 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
                type="submit"
                disabled={isSendButtonDisabled}
            >
                {isSending ? (
                    <IconRefresh className="h-4 w-4 animate-spin" />
                ) : cooldownSeconds > 0 ? (
                    <span>Resend in {cooldownSeconds}s</span>
                ) : (
                    <>
                        <IconPhone className="h-4 w-4" />
                        <span>Send OTP</span>
                    </>
                )}
                <BottomGradient />
            </button>

            {/* Success Message */}
            {successMessage && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2 text-center font-medium">
                    ✓ {successMessage}
                </p>
            )}
        </form>
    )
}

export default SendOtp;
