"use client"
import React, { useEffect, useState } from 'react'
import { LabelInputContainer, BottomGradient } from "../ui/signup-form-demo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { Error } from "@/types"; // Assuming you have this type defined
import { useSearchParams, useRouter } from 'next/navigation';
import { signin } from '@/redux/actions/authActions';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store/store';
import Loader from '../Loader/Loader';

import { auth } from '@/lib/firebase'

import SocialMediaAuth from '../SocialMediaAuth/SocialMediaAuth';
import LoginSuccess from '../LoginSuccess/LoginSuccess';


function SigninForm() {

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  const dispatch = useDispatch<AppDispatch>()
  const { loading, user, isSocialLoading } = useSelector((state: RootState) => state.authState)

  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || '/'

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Error>({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);


  //* for user login with social media icons
  useEffect(() => {
    // Only auto-redirect for social login (not email/password - that shows LoginSuccess first)
    if (user && !showLoginSuccess && auth?.currentUser?.providerData[0]?.providerId !== 'password') {
      setShowLoginSuccess(true)
    }
  }, [user, redirect, router, showLoginSuccess])


  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("Form Data:", formData);

    const newErrors: Error = {};
    let hasError = false;

    // --- EMAIL VALIDATION ---
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = true;
      hasError = true;
    }

    // --- PASSWORD VALIDATION ---
    // For login, we usually just check if it's empty, not the complexity regex
    if (!formData.password) {
      newErrors.password = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    } else {
      setErrorMessage(null);

      dispatch(signin(formData)).then((result: any) => {
        if (result === true || result?.success) {
          setFormData({ email: '', password: '' })

          //* for user login manually with email and password
          setShowLoginSuccess(true) // Show success component instead of immediate redirect
        } else {
          // Handle error from object return
          setErrorMessage(result?.error || 'Login failed');
        }
      });
    }

  };

  // --- CLEAR ERROR ON FOCUS ---
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };



  return (
    <div className="max-w-md w-full h-auto mx-auto rounded-2xl p-3 md:p-8 shadow-input bg-white dark:bg-black">
      {/* --- HEADER --- */}
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome back
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Ready to get things done? Login to access your tasks.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* --- EMAIL --- */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            value={formData.email}
            className={`${errors.email ? 'animate-shake ring-2 ring-red-500' : ''}`}
            onFocus={() => clearError('email')}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              Please enter your valid email.
            </p>
          )}
        </LabelInputContainer>

        {/* --- PASSWORD --- */}
        <LabelInputContainer className="mb-8">
          <div className='flex justify-between'>
            <Label htmlFor="password">Password</Label>
            <Link className='text-sm font-medium hover:underline' href={redirect !== '/' ? `/resetPassword?redirect=${encodeURIComponent(redirect)}` : '/resetPassword'}>Forgot your password?</Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              className={`${errors.password ? 'animate-shake ring-2 ring-red-500' : ''} pr-10`}
              onFocus={() => clearError('password')}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              Please enter your password.
            </p>
          )}

          {/* --- ERROR MESSAGE --- */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">
                {errorMessage.includes('Please verify your email') ? (
                  <>Your email is not verified yet.{' '}<Link className='underline text-blue-500 hover:underline font-bold' href={`${redirect !== '/' ? `/verifyEmail?redirect=${encodeURIComponent(redirect)}` : '/verifyEmail'}`}>Verify here</Link></>
                ) : (errorMessage.includes('auth/invalid-credential') || errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')) ? (
                  <>Invalid Email or Password</>
                ) : (
                  <>{errorMessage}</>
                )}
              </span>
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
          className="cursor-pointer bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] relative group/btn"
          type="submit"
        >
          Login &rarr;
          <BottomGradient />
        </button>

        {/* --- DIVIDER --- */}
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        {/* --- SOCIAL BUTTONS --- */}
        <SocialMediaAuth redirect={redirect} />
      </form>

      {/* --- DONT HAVE AN ACCOUNT? --- */}
      <div className="text-center mt-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href={`${redirect !== '/' ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'}`} className="text-blue-500 hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </div>

      <div className={`absolute top-0 flex justify-center items-center left-0 w-full h-full bg-black/80 z-[1] ${loading && !isSocialLoading ? 'flex' : 'hidden'}`}>
        <Loader />
      </div>

      {/* Login Success Component */}
      {showLoginSuccess && (
        <LoginSuccess
          userName={user?.full_name || auth.currentUser?.displayName || 'User'}
          redirectPath={redirect}
          onComplete={() => router.push(redirect)}
          delayMs={9000}
        />
      )}
    </div>
  );
}

export default SigninForm