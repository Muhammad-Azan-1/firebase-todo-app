"use client"

import React, { ReactNode, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { auth } from '@/lib/firebase'
import { getCookie, deleteCookie } from "cookies-next";
import { LOGIN_COMPLETED, LOGOUT } from '@/redux/reducers/authReducer'

const AuthProvder = ({ children }: { children: ReactNode; }) => {

   const dispatch = useDispatch()

   useEffect(() => {
      const subscribe = onAuthStateChanged(auth, async (user) => {
         // console.log("AuthProvider Check Running...")
         // console.log("Current user:", user)
         // console.log("Email verified:", user?.emailVerified)

         //! Check if we have our manual session cookie
         //! This cookie is ONLY set when user manually logs in via signin action
         const hasSessionCookie = getCookie("Auth-cookie");
         // console.log("Has session cookie:", hasSessionCookie)
         //  deleteCookie("Auth-cookie");
         if (user) {



            if (user.emailVerified || auth?.currentUser?.providerData[0]?.providerId !== 'password') { // for checking is auth does not required email verfication



               //! SCENARIO 1: Verified User + Has Cookie
               //! User manually logged in before → restore their session
               if (hasSessionCookie) {
                  // console.log("✅ Restoring valid session - user has cookie");
                  dispatch(LOGIN_COMPLETED({
                     full_name: user.displayName,
                     email: user.email,
                     uid: user.uid,
                  }));
               }

               //! SCENARIO 2: Verified User + NO Cookie
               //! User just verified email via link but hasn't logged in manually yet
               //! Since cookie is set immediately at sign-in, no cookie = not logged in
               else {
                  // console.log("⚠️ User verified but no cookie - waiting for login...");

               }

            } else {
               //! SCENARIO 3: User exists but NOT Verified (The "Verify Email" Page)
               //! We DO NOT sign them out here!
               //! We keep them signed in to Firebase so "Resend Email" button works
               //! But we ensure no cookie exists (they haven't logged in)
               // console.log("📧 User pending verification. Keeping Firebase session for Resend functionality.");
               deleteCookie("Auth-cookie");
               //! Important: We do NOT dispatch LOGOUT here
               //! auth.currentUser stays available for resend
            }

         } else {
            //! SCENARIO 4: No User at all
            // console.log("❌ No user found");
            dispatch(LOGOUT())
            deleteCookie("Auth-cookie")
         }
      })

      //! Cleanup subscription on unmount
      return () => subscribe();

   }, [dispatch])

   return (
      <>
         {children}
      </>
   )
}

export default AuthProvder