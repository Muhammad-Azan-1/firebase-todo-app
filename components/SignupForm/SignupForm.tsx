"use client";
import {
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/signup-form-demo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppDispatch, RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";

import { signupWithEmailPass } from "@/redux/actions/authActions";
import { Error, User } from "@/types";

import Loader from "../Loader/Loader";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import SocialMediaAuth from "../SocialMediaAuth/SocialMediaAuth";
import LoginSuccess from "../LoginSuccess/LoginSuccess";

import { auth } from '@/lib/firebase'

function SignupForm() {

  // RFC 5322 compliant email regex
  // Note: This validates EMAIL FORMAT. Typos like "gmal.com" instead of "gmail.com" 
  // are still valid formats - detecting those requires email verification services.
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  const dispatch = useDispatch<AppDispatch>();
  const { loading, emailSent, user, isSocialLoading } = useSelector((state: RootState) => state?.authState)

  const params = useSearchParams()
  const redirect: string = params.get("redirect") || '/'
  const router = useRouter()

  // console.log(redirect)


  useEffect(() => {
    if (emailSent) {
      let route = redirect !== '/' ? `/verifyEmail?redirect=${encodeURIComponent(redirect)}` : '/verifyEmail'
      router.push(route)
    }

  }, [emailSent, router, redirect])


  //* once user Signup successfully then router.push(redirect) send a request to the proxy.ts file for redirecting the user to the
  //* from the page they came
  //* For social login on signup page, show LoginSuccess (no signup flow needed for social)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    // For social logins on signup page, show LoginSuccess then redirect
    if (user && !showLoginSuccess && auth?.currentUser?.providerData[0]?.providerId !== 'password') {
      setShowLoginSuccess(true)
    }
  }, [user, showLoginSuccess])




  const [formData, setFromData] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Error>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // console.log("Form Data :", formData);

    //! Error handling
    const newErrors: Error = {};
    let hasError = false;

    if (!formData.firstName.trim()) {
      newErrors.firstName = true;
      hasError = true;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = true;
      hasError = true;
    }

    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = true;
      hasError = true;

    }

    if (
      !formData.password ||
      formData.password.length < 8 ||
      !specialCharRegex.test(formData.password)
    ) {
      // false / true / true
      newErrors.password = true;
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword || formData.confirmPassword === '') {
      newErrors.confirmPassword = true;
      hasError = true;
    }


    if (hasError) {
      setErrors(newErrors);
      // console.log(newErrors, hasError);
      return;

    } else {
      setErrorMessage(null);
      dispatch(signupWithEmailPass(formData, redirect)).then((result: any) => {
        if (result === true || result?.success) {
          setFromData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: '' })
        } else {
          // Handle error from object return
          setErrorMessage(result?.error || 'Signup failed');
          setFromData((prev) => ({ ...prev, email: '' }))
        }
      });
    }
  };


  //* This function says: "If this specific input (e.g., email) is currently marked as an error, remove the error mark immediately when the user touches it."
  const clearError = (field: string) => {
    // If 'email' has an error...
    if (errors[field]) {
      // Keep all other errors, but set 'email' error to false (remove red border)
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };


  return (
    <div className="max-w-md w-full h-auto mx-auto rounded-2xl p-3 md:p-6 shadow-input bg-white dark:bg-black">
      {/* --- HEADER --- */}
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome to Todo App
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Create your account to start managing your tasks efficiently.
      </p>

      <div className="my-4">
        {/* --- NAME FIELDS --- */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input
              id="firstname"
              className={`${errors.firstName ? "animate-shake ring-2 ring-red-500" : ""}`}
              value={formData.firstName}
              placeholder="Tyler"
              type="text"
              onFocus={() => clearError("firstName")}
              onChange={(e) =>
                setFromData({ ...formData, firstName: e.target.value })
              }
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                Please enter your first name.
              </p>
            )}
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input
              id="lastname"
              placeholder="Durden"
              type="text"
              className={`${errors.lastName ? "animate-shake ring-2 ring-red-500" : ""}`}
              value={formData.lastName}
              onFocus={() => clearError("lastName")}
              onChange={(e) =>
                setFromData({ ...formData, lastName: e.target.value })
              }
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                Please enter your last name.
              </p>
            )}
          </LabelInputContainer>
        </div>



        {/* --- EMAIL --- */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            value={formData.email}
            className={`${errors.email || (errorMessage && errorMessage.includes("already-in-use")) ? "animate-shake ring-2 ring-red-500" : ""}`}
            onFocus={() => clearError("email")}
            onChange={(e) =>
              setFromData({ ...formData, email: e.target.value })
            }
          />

          {errors.email && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              Please enter a valid email
            </p>
          )}

          {/* --- ERROR MESSAGE --- */}
          {errorMessage && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">
                {errorMessage.includes('already-in-use') ? (
                  <>This email is already registered.{' '}<Link className='underline text-blue-500 hover:underline font-bold' href='/signin'>Login instead</Link></>
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


        {/* --- PASSWORD --- */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              className={`${errors.password ? "animate-shake ring-2 ring-red-500" : ""} pr-10`}
              onFocus={() => clearError("password")}
              onChange={(e) =>
                setFromData({ ...formData, password: e.target.value })
              }
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
              Password must be at least 8 characters and include a special
              character (!@#$).
            </p>
          )}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              className={`${errors.confirmPassword ? "animate-shake ring-2 ring-red-500" : ""} pr-10`}
              onFocus={() => clearError("confirmPassword")}
              onChange={(e) =>
                setFromData({ ...formData, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              {showConfirmPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              Passwords do not match
            </p>
          )}
        </LabelInputContainer>

        {/* --- SUBMIT BUTTON --- */}
        <button
          className="cursor-pointer bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] relative group/btn"
          onClick={handleSubmit}
        >
          Sign up &rarr;
          <BottomGradient />
        </button>

        {/* --- DIVIDER --- */}
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        {/* --- SOCIAL BUTTONS --- */}
        {/* --- SOCIAL BUTTONS (Square Row Layout) --- */}
        <SocialMediaAuth redirect={redirect} />
      </div>

      {/* --- ALREADY HAVE ACCOUNT? --- */}
      <div className="text-center mt-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Already have an account?{" "}
          <Link
            href={`${redirect !== '/' ? `/signin?redirect=${encodeURIComponent(redirect)}` : '/signin'}`} // encodeURIComponent(redirect) convert / to 2F%
            className="text-blue-500 hover:underline font-bold"
          >
            Log in
          </Link>
        </p>
      </div>

      <div className={`absolute top-0 flex justify-center items-center left-0 w-full h-full bg-black/80 z-[1] ${loading && !isSocialLoading ? 'flex' : 'hidden'}`}>
        <Loader />
      </div>


      {/* Login Success Component for Social Auth */}
      {showLoginSuccess && (
        <LoginSuccess
          userName={user?.full_name || auth.currentUser?.displayName || 'User'}
          redirectPath={redirect}
          onComplete={() => router.push(redirect)}
          delayMs={2500}
        />
      )}

    </div>

  );
}

export default SignupForm;




//* design one

// {/* --- SOCIAL BUTTONS --- */}
//       <div className="flex flex-col space-y-4">
//         <button
//           className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
//           type="button" // Important: type="button" prevents form submission
//         >
//           <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
//           <span className="text-neutral-700 dark:text-neutral-300 text-sm">
//             Google
//           </span>
//           <BottomGradient />
//         </button>

//         <button
//           className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
//           type="button"
//         >
//           <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
//           <span className="text-neutral-700 dark:text-neutral-300 text-sm">
//             GitHub
//           </span>
//           <BottomGradient />
//             </button>

//          <button
//           className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
//           type="button"
//         >
//           <span className="text-neutral-700 dark:text-neutral-300 text-sm">
//           <IconBrandX className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
//           </span>
//           <BottomGradient />
//           </button>

//          <button
//           className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
//           type="button"
//         >
//           <IconBrandFacebook className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
//           <span className="text-neutral-700 dark:text-neutral-300 text-sm">
//            Facebook
//           </span>
//           <BottomGradient />
//           </button>

//          <button
//           className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
//           type="button"
//         >
//           <IconPhone className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
//           <span className="text-neutral-700 dark:text-neutral-300 text-sm">
//            Phone Number
//           </span>
//           <BottomGradient />
//           </button>

//       </div>
