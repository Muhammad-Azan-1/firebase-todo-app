"use client"

import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { LabelInputContainer, BottomGradient } from "@/components/ui/signup-form-demo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import Link from "next/link";
import { RootState, AppDispatch } from '@/redux/store/store'

import { Error } from "@/types"
import { reset_Password } from '@/redux/actions/authActions'
import { useSearchParams } from 'next/navigation';
import { IconArrowRight, IconRefresh, IconAlertCircle, IconX } from "@tabler/icons-react";

const ResetPassword = () => {

  const params = useSearchParams()
  const redirect = params.get("redirect") || '/'
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;


  const dispatch = useDispatch<AppDispatch>()
  const { loading, resetPass } = useSelector((state: RootState) => state.authState)

  const [Email, setEmail] = useState('')
  const [emailError, setError] = useState<Error>({})
  const [isResending, setisResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<"idle" | "send" | "error" | "">("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const COOLDOWN_KEY2 = "resetPasswordCooldownEnd";
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const end = localStorage.getItem(COOLDOWN_KEY2);
    return end ? Math.max(0, Math.ceil((+end - Date.now()) / 1000)) : 0;
  });



  useEffect(() => {

    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer)
    } else {
      localStorage.removeItem(COOLDOWN_KEY2);
      if (resendStatus === "send") setResendStatus("idle");
    }

  }, [cooldownSeconds, resendStatus])


  //! Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  const startCooldown = (seconds: number) => {
    localStorage.setItem(COOLDOWN_KEY2, String(Date.now() + seconds * 1000)); // end time if start at 10:00 end time will be 10:30
    setCooldownSeconds(seconds)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const newErrors: Error = {};
    let hasError = false;
    // --- EMAIL VALIDATION ---
    if (!Email.trim() || !emailRegex.test(Email)) {
      newErrors.email = true;
      hasError = true;
    }
    if (hasError) {
      setError(newErrors)
      return
    } else {

      //----- main work for resent password email ----
      if (isResending || cooldownSeconds > 0) return;

      setisResending(true)
      setErrorMessage(null)

      try {

        const result = await dispatch(reset_Password(Email, redirect))


        if (result.success) {
          setResendStatus('send')
          startCooldown(30)
        }

        else {
          setResendStatus("error");
          if (result.error === 'too-many-requests') {
            setErrorMessage("Too many requests. Please wait a few minutes before trying again.");
            startCooldown(60)
          } else if (result.error === 'auth/user-not-found') {
            setErrorMessage("Session expired. Please sign up again.");
          } else {
            setErrorMessage("Failed to send reset password email. Please try again later.");
          }

        }


      } catch (error: any) {
        console.log("ERROR", error)
        setErrorMessage("Something went wrong please try again later")
        setResendStatus("error")


      } finally {
        setisResending(false)
      }

    }
  }

  const clearError = (field: string) => {

    if (emailError[field]) {
      setError({ [field]: false })
    }
  };


  // Logic to determine login URL based on redirect
  const loginUrl = redirect !== '/'
    ? `/signin?redirect=${encodeURIComponent(redirect)}`
    : "/signin";

  //! Determine button disabled state
  const isButtonDisabled = isResending || cooldownSeconds > 0;


  return (
    <>
      <div className="max-w-md w-full  h-auto mx-auto rounded-none md:rounded-2xl p-4 md:p-8  shadow-input bg-white dark:bg-black">
        {/* --- HEADER --- */}
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Reset Password
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Please enter your valid email address to reset your password
        </p>

        <form className="mt-8 mb-3" onSubmit={handleSubmit}>
          {/* --- EMAIL --- */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="projectmayhem@fc.com"
              type="email"
              value={Email}
              className={` ${emailError?.email ? 'animate-shake ring-2 ring-red-500' : ''}`}
              onFocus={() => clearError('email')}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                Please enter your valid email.
              </p>

            )}

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

          {/* --- SUBMIT BUTTON --- */}
          <button
            className="cursor-pointer group/btn relative flex h-10 w-full items-center justify-center border-1 space-x-2 rounded-md bg-gray-80 px-4 font-medium text-black shadow-input transition-all hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            type="submit"
            disabled={isButtonDisabled}
          >
            {

              isResending ? (
                <IconRefresh className="h-4 w-4 animate-spin text-neutral-500" />
              ) : cooldownSeconds > 0 ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ✓ Link Sent! Resend in {cooldownSeconds}s
                </span>
              ) : (
                <span className="text-neutral-700 dark:text-neutral-200">Send Reset Password Link</span>
              )

            }

            <BottomGradient />
          </button>



          <Link href={loginUrl} className="block mt-3 w-full">
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


        </form>



      </div>
    </>
  )
}

export default ResetPassword;


