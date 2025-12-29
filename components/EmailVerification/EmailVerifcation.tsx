"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconMail, IconArrowRight, IconRefresh, IconAlertCircle, IconX } from "@tabler/icons-react";
import { BottomGradient } from "../ui/signup-form-demo";
import { useDispatch, useSelector } from "react-redux";
import { verifyingEmail } from "@/redux/actions/authActions";
import { AppDispatch, RootState } from "@/redux/store/store";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";


const EmailVerificationSent = () => {

  const dispatch = useDispatch<AppDispatch>()
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error" | ''>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('')

  const { user } = useSelector((state: RootState) => state.authState)
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/"

  //! Cooldown timer state with localStorage persistence
  const COOLDOWN_KEY = "emailVerifyCooldownEnd";
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const end = localStorage.getItem(COOLDOWN_KEY);
    return end ? Math.max(0, Math.ceil((+end - Date.now()) / 1000)) : 0;
  });

  //! Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem(COOLDOWN_KEY);
      if (resendStatus === "sent") setResendStatus("idle");
    }
  }, [cooldownSeconds, resendStatus]);

  //! Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  //! Helper to set cooldown and persist to localStorage
  const startCooldown = (seconds: number) => {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000)); // end time if start at 10:00 end time will be 10:30
    setCooldownSeconds(seconds);
  };

  const handleResendClick = async () => {
    if (isResending || cooldownSeconds > 0) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const result = await dispatch(verifyingEmail(redirect));

      if (result.success) {
        setResendStatus("sent");
        startCooldown(30);
        setSuccessMsg("Link Sent !")
      } else {
        setResendStatus("error");
        if (result.error === 'too-many-requests') {
          setErrorMessage("Too many requests. Please wait a few minutes before trying again.");
          startCooldown(60);
        } else if (result.error === 'no-user') {
          setErrorMessage("Session expired. Please sign up again.");
        } else {
          setErrorMessage("Failed to send email. Please try again later.");
        }
      }
    } catch (error) {
      // console.error("Failed to resend", error);
      setResendStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };


  // Logic to determine login URL based on redirect
  const loginUrl = redirect !== '/'
    ? `/signin?redirect=${encodeURIComponent(redirect)}`
    : "/signin";

  //! Determine button disabled state
  const isButtonDisabled = isResending || cooldownSeconds > 0;

  return (
    <div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input md:rounded-2xl md:p-8 dark:bg-black">

      {/* Animated Icon Container */}
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-20 dark:bg-green-900"></div>
          <IconMail className="relative h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h2 className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Verify your email
      </h2>

      <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300">
        We&apos;ve sent a verification link to: <br />
        <span className="font-bold text-neutral-800 dark:text-white">
          {user?.email || auth.currentUser?.email}
        </span>
      </p>

      {/* Instructional Box */}
      <div className="my-6 rounded-lg bg-neutral-50 p-4 text-center text-xs text-neutral-500 dark:bg-zinc-900/50 dark:text-neutral-400">
        <p className="leading-relaxed">
          Click the link in the email to activate your account. <br />
          If you don&apos;t see it, check your spam folder.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
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



      <div className="flex flex-col space-y-4">

        {/* Resend Button with Cooldown Timer */}
        <button
          onClick={handleResendClick}
          disabled={isButtonDisabled}
          className="cursor-pointer group/btn relative flex h-10 w-full items-center justify-center border-1 space-x-2 rounded-md bg-gray-80 px-4 font-medium text-black shadow-input transition-all hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          {isResending ? (
            <IconRefresh className="h-4 w-4 animate-spin text-neutral-500" />
          ) : (cooldownSeconds > 0 && resendStatus === '') || resendStatus === "sent" ? (
            //! Show success + countdown together
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ✓ Link Sent! Resend in {cooldownSeconds}s
            </span>
          ) : cooldownSeconds > 0 ? (
            //! Show countdown only (for rate limit errors)
            <span className="text-neutral-500 dark:text-neutral-400">
              Resend in {cooldownSeconds}s
            </span>
          ) : (
            <span className="text-neutral-700 dark:text-neutral-200">Resend Verification Email</span>
          )}
          <BottomGradient />
        </button>


        {/* Login / Continue Button */}
        <Link href={loginUrl} className="block w-full">
          <button
            className="cursor-pointer  group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Proceed to Login</span>
              <IconArrowRight className="h-4 w-4" />
            </div>
            <BottomGradient />
          </button>
        </Link>

      </div>
    </div>
  );
};


export default EmailVerificationSent;


//! TImer logic


// +end                    // Convert string to number (localStorage stores strings)
//                         // Example: "1735086030000" → 1735086030000 (end timestamp)
// Date.now()              // Current time in milliseconds
//                         // Example: 1735086025000 (now)
// +end - Date.now()       // Difference in milliseconds
//                         // Example: 1735086030000 - 1735086025000 = 5000ms
// (+end - Date.now()) / 1000   // Convert to seconds
//                              // Example: 5000 / 1000 = 5 seconds
// Math.ceil(...)          // Round UP to nearest integer
//                         // Example: 5.3 → 6 seconds
// Math.max(0, ...)        // Don't allow negative values
//                         // If time passed, return 0, not -5


// 10:00:00  User clicks "Resend"
//           ├── localStorage saves: "1735086030000" (10:00:30)
//           └── setCooldownSeconds(30)   ← Direct value
// 10:00:25  User refreshes page
//           ├── Reads localStorage: "1735086030000"
//           ├── Date.now() = 1735086025000
//           ├── Calculation: (30000 - 25000) / 1000 = 5
//           └── setCooldownSeconds(5)   ← Calculated value!