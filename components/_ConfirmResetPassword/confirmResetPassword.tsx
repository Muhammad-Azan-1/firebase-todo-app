// This component is disabled - feature not working with Firebase Auth
// The original code is preserved below as comments for future implementation

const ConfirmResetPassword = () => {
    return (
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black flex flex-col items-center text-center">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-2">
                Feature Not Available
            </h2>
            <p className="text-neutral-600 text-sm max-w-sm mb-6 dark:text-neutral-300">
                Custom password reset confirmation is not supported with Firebase Auth.
                Please use the link in your email to reset your password directly.
            </p>
        </div>
    );
};

export default ConfirmResetPassword;

// "use client"

// import { useDispatch } from 'react-redux'
// import React, { useState, useEffect } from 'react'
// import { LabelInputContainer, BottomGradient } from "@/components/ui/signup-form-demo"
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import Link from 'next/link';
// import { Error } from '@/types';
// // import { confirm_Password_Reset } from '@/redux/actions/authActions'; // Feature not implemented
// import { useSearchParams } from 'next/navigation';
// import { AppDispatch } from "@/redux/store/store"

// import { IconRefresh, IconEye, IconEyeOff, IconAlertCircle } from "@tabler/icons-react";


// const ConfirmResetPassword = () => {

//     const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
//     const [newPassword, setNewPassword] = useState('')
//     const [confirmPassword, setConfirmPassword] = useState('')
//     const [errors, setErrors] = useState<Error>({});
//     const [isResend, setIsResending] = useState(false)
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [errorMsg, setErrorMsg] = useState('')
//     const [success, setSuccess] = useState(false)

//     const params = useSearchParams()
//     const oobCode: string | null = params.get("oobCode")
//     const redirect: string = params.get("redirect") || '/'

//     const dispatch = useDispatch<AppDispatch>()

//     const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault()

//         const newErrors: Error = {};
//         let hasError = false;

//         // Password validation
//         if (!newPassword || newPassword?.length < 8 || !specialCharRegex?.test(newPassword)) {
//             newErrors.newPassword = true;
//             hasError = true;
//         }

//         // Confirm password validation
//         if (!confirmPassword || confirmPassword !== newPassword) {
//             newErrors.confirmPassword = true;
//             hasError = true;
//         }

//         if (hasError) {

//             setErrors(newErrors);
//             return;
//         } else {

//             try {
//                 console.log("Running")
//                 setIsResending(true)

//                 let result = await dispatch(confirm_Password_Reset(oobCode, newPassword))
//                 console.log(result, "REsult")
//                 if (result?.success) {
//                     setSuccess(true)

//                 } else {
//                     setSuccess(false)
//                     if (result?.error === 'auth/expired-action-code') {
//                         setErrorMsg("This link has expired or has already been used. Please request a new password reset.")
//                     } else if (result?.error === 'auth/user-not-found') {
//                         setErrorMsg("Session expired. Please sign up again.");

//                     } else {
//                         setErrorMsg("Failed to send email. Please try again later.");
//                     }

//                 }
//             } catch (err: any) {

//                 setSuccess(false)
//                 setErrorMsg("Something went wrong. Please try again.");

//             } finally {
//                 setIsResending(false)
//             }

//         }





//     }

//     const clearError = (field: string) => {

//         if (errors[field]) {
//             setErrors(prev => ({ ...prev, [field]: false }))
//         }
//     }

//     //! Auto-dismiss error messages after 5 seconds
//     useEffect(() => {
//         if (errorMsg) {
//             const timer = setTimeout(() => setErrorMsg(''), 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [errorMsg]);




//     if (success) {
//         return (
//             <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black flex flex-col items-center text-center">
//                 <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                 </div>

//                 <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-2">
//                     Password Reset Successful!
//                 </h2>

//                 <p className="text-neutral-600 text-sm max-w-sm mb-6 dark:text-neutral-300">
//                     Your password has been updated successfully. You can now login with your new password.
//                 </p>

//                 <Link
//                     className="cursor-pointer items-center flex justify-center bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] relative group/btn"
//                     href={`${redirect !== '/' ? `/signin?redirect=${encodeURIComponent(redirect)}` : '/signin'}`}
//                 >
//                     Sign in &rarr;
//                     <BottomGradient />
//                 </Link>

//             </div>
//         );
//     }


//     return (
//         <>
//             <div className="max-w-md w-full h-auto mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
//                 {/* --- HEADER --- */}
//                 <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
//                     Set New Password
//                 </h2>
//                 <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
//                     Please enter your new password below
//                 </p>

//                 <form className="my-8" onSubmit={handlePasswordReset}>
//                     {/* --- NEW PASSWORD --- */}
//                     <LabelInputContainer className="mb-4">
//                         <Label htmlFor="newPassword">New Password</Label>
//                         <div className="relative">
//                             <Input
//                                 id="newPassword"
//                                 placeholder="••••••••"
//                                 type={showNewPassword ? "text" : "password"}
//                                 value={newPassword}
//                                 className={`${errors.newPassword ? 'animate-shake ring-2 ring-red-500' : ''} pr-10`}
//                                 onFocus={() => clearError('newPassword')}
//                                 onChange={(e) => setNewPassword(e.target.value)}
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setShowNewPassword(!showNewPassword)}
//                                 className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
//                             >
//                                 {showNewPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
//                             </button>
//                         </div>
//                         {errors.newPassword && (
//                             <p className="text-red-500 text-xs mt-1 font-medium">
//                                 Password must be at least 8 characters and include a special character (!@#$).
//                             </p>
//                         )}
//                     </LabelInputContainer>

//                     {/* --- CONFIRM PASSWORD --- */}
//                     <LabelInputContainer className="mb-8">
//                         <Label htmlFor="confirmPassword">Confirm Password</Label>
//                         <div className="relative">
//                             <Input
//                                 id="confirmPassword"
//                                 placeholder="••••••••"
//                                 type={showConfirmPassword ? "text" : "password"}
//                                 value={confirmPassword}
//                                 className={`${errors!.confirmPassword ? 'animate-shake ring-2 ring-red-500' : ''} pr-10`}
//                                 onFocus={() => clearError('confirmPassword')}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                                 className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
//                             >
//                                 {showConfirmPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
//                             </button>
//                         </div>
//                         {errors!.confirmPassword && (
//                             <p className="text-red-500 text-xs mt-1 font-medium">
//                                 Passwords do not match.
//                             </p>
//                         )}

//                         {/* --- ERROR MESSAGE --- */}
//                         {!errors.newPassword && !errors.confirmPassword && errorMsg && (
//                             <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
//                                 <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
//                                 <span>{errorMsg}</span>
//                             </div>
//                         )}


//                     </LabelInputContainer>



//                     {/* firebase failure error */}




//                     {/* --- SUBMIT BUTTON --- */}
//                     <button
//                         className="cursor-pointer bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] relative group/btn"
//                         type="submit"
//                         disabled={isResend}
//                     >
//                         {
//                             isResend ?
//                                 (<IconRefresh className="h-4 w-4 animate-spin text-neutral-500" />)
//                                 : ('Send Reset Password Request')
//                         }
//                         <BottomGradient />
//                     </button>

//                 </form>

//             </div>
//         </>
//     )
// }

// export default ConfirmResetPassword



// //! Important


// //* what is oobCode ? why it is required when ever we are reseting a user password

// // `oobCode` stands for **Out-of-Band Code**.

// // It is a unique, one-time-use "secret key" that Firebase generates and puts inside the link sent to the user's email.

// // ### Why do we need it?

// // Since the email link opens a completely new browser window (or even a different device), your React app has no memory of the previous session. It doesn't know *who* is trying to reset the password.

// // The `oobCode` solves this:

// // 1. **User clicks "Reset Password":** Firebase creates a secret code (e.g., `xyz123`) and links it to that specific user's email in its internal database.
// // 2. **User gets an Email:** The link looks like `myapp.com/reset?oobCode=xyz123`.
// // 3. **User clicks the Link:** They arrive at your site. Your site grabs `xyz123` from the URL.
// // 4. **You call `confirmPasswordReset`:** You send `xyz123` + `NewPassword` back to Firebase.
// // 5. **Firebase Verifies:** "Ah, `xyz123` belongs to User A. Okay, I will change User A's password."

// // **Important:** This code expires quickly (usually within 1 hour) and can only be used once. If the user clicks it a second time, it will fail.

// //*