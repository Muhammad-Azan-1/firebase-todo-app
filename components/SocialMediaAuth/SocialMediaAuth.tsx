
"use client";
import { useState, useEffect } from "react";
import {
  BottomGradient,
} from "@/components/ui/signup-form-demo";

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandX,
  IconBrandFacebook,
  IconPhone,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";

import { useDispatch, useSelector } from "react-redux";
import { socialAuth } from '@/redux/actions/authActions'
import { AppDispatch, RootState } from '@/redux/store/store'
import Link from "next/link";
import { redirect } from "next/navigation";

// Helper function to get user-friendly error messages for social auth
const getSocialAuthErrorMessage = (errorCode: string, provider: string): string => {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  // Common Firebase auth error codes
  if (errorCode.includes('popup-closed-by-user')) {
    return `${providerName} sign-in was cancelled. Please try again.`;
  }
  if (errorCode.includes('popup-blocked')) {
    return `Pop-up was blocked. Please allow pop-ups for this site and try again.`;
  }
  if (errorCode.includes('account-exists-with-different-credential')) {
    return `An account already exists with this email using a different sign-in method.`;
  }
  if (errorCode.includes('cancelled-popup-request')) {
    return `Sign-in was cancelled. Please try again.`;
  }
  if (errorCode.includes('network-request-failed')) {
    return `Network error. Please check your connection and try again.`;
  }
  if (errorCode.includes('too-many-requests')) {
    return `Too many attempts. Please try again later.`;
  }
  if (errorCode.includes('user-disabled')) {
    return `This account has been disabled.`;
  }
  if (errorCode.includes('unauthorized-domain')) {
    return `This domain is not authorized for ${providerName} sign-in.`;
  }
  if (errorCode.includes('operation-not-allowed')) {
    return `${providerName} sign-in is not enabled. Please contact support.`;
  }

  // Default fallback
  return `${providerName} sign-in failed. Please try again.`;
};




const SocialMediaAuth = ({ redirect }: { redirect: string }) => {

  console.log(redirect)

  const dispatch = useDispatch<AppDispatch>()
  const { isSocialLoading } = useSelector((state: RootState) => state.authState)

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null); // Track which button was clicked

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Reset activeProvider when loading completes
  useEffect(() => {
    if (!isSocialLoading) {
      setActiveProvider(null);
    }
  }, [isSocialLoading]);


  const handlingSocialMediaAuth = async (type: string) => {
    // Clear any previous error
    setErrorMessage(null);
    setActiveProvider(type); // Track which provider button was clicked

    let result;
    if (type === 'google') {
      result = await dispatch(socialAuth('google'))
    } else if (type === 'x') {
      result = await dispatch(socialAuth('twitter'))
    }
    else if (type === 'facebook') {
      result = await dispatch(socialAuth('facebook'))
    }
    else if (type === 'github') {
      result = await dispatch(socialAuth('github'))
    }

    if (result && result.success) {
      console.log(type, " auth completed successfully")
    } else {
      console.log(type, " auth rejected with an error", result?.message)
      // Set user-friendly error message
      const errorCode = result?.message || '';
      setErrorMessage(getSocialAuthErrorMessage(errorCode, type));
    }

  }


  return (
    <>
      {/* --- SOCIAL BUTTONS --- */}
      <div className="flex flex-row justify-between space-x-2 w-full">
        {/* Google */}
        <button
          className={`cursor-pointer relative group/btn flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 font-medium shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] ${isSocialLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          aria-label="Sign in with Google"
          onClick={() => handlingSocialMediaAuth("google")}
          disabled={isSocialLoading}
        >
          {isSocialLoading && activeProvider === 'google' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-600 dark:border-t-neutral-200" />
          ) : (
            <IconBrandGoogle className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
          )}
          <BottomGradient />
        </button>

        {/* GitHub */}
        <button
          className={`cursor-pointer relative group/btn flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 font-medium shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] ${isSocialLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          aria-label="Sign in with GitHub"
          onClick={() => handlingSocialMediaAuth("github")}
          disabled={isSocialLoading}
        >
          {isSocialLoading && activeProvider === 'github' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-600 dark:border-t-neutral-200" />
          ) : (
            <IconBrandGithub className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
          )}
          <BottomGradient />
        </button>

        {/* X (Twitter) */}
        <button
          className={`cursor-pointer relative group/btn flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 font-medium shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] ${isSocialLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          aria-label="Sign in with X"
          onClick={() => handlingSocialMediaAuth("x")}
          disabled={isSocialLoading}
        >
          {isSocialLoading && activeProvider === 'x' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-600 dark:border-t-neutral-200" />
          ) : (
            <IconBrandX className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
          )}
          <BottomGradient />
        </button>

        {/* Facebook */}
        <button
          className={`cursor-pointer relative group/btn flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 font-medium shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] ${isSocialLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          aria-label="Sign in with Facebook"
          onClick={() => handlingSocialMediaAuth("facebook")}
          disabled={isSocialLoading}
        >
          {isSocialLoading && activeProvider === 'facebook' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-600 dark:border-t-neutral-200" />
          ) : (
            <IconBrandFacebook className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
          )}
          <BottomGradient />
        </button>


        {/* Phone - Link to phone-signin page */}
        <Link
          href={`${redirect !== '/' ? `/phoneSignin?redirect=${encodeURIComponent(redirect)}` : '/phoneSignin'}`}
          className={`cursor-pointer relative group/btn flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 font-medium shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] ${isSocialLoading ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label="Sign in with Phone">
          <IconPhone className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
          <BottomGradient />
        </Link>



        .</div>



      {/* --- ERROR MESSAGE --- */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
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

    </>
  )
}

export default SocialMediaAuth