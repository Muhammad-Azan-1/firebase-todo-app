import { AppDispatch } from "../store/store"
import { User } from "@/types"


import {
    SIGNUP_STARTED, SIGNUP_COMPLETED, SIGNUP_FAILURE, VERIFICATION_EMAIL_SENT,
    LOGIN_STARTED, LOGIN_COMPLETED, LOGIN_FAILURE, VERIFICATION_EMAIL_COMPLETED, LOGOUT
}
    from "../reducers/authReducer"

import { auth, db } from '@/lib/firebase'
import {
    createUserWithEmailAndPassword, updateProfile,
    sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail,

    GoogleAuthProvider, signInWithPopup,
    FacebookAuthProvider,
    TwitterAuthProvider,
    GithubAuthProvider,

    RecaptchaVerifier,
    signInWithPhoneNumber,

    signOut


} from "firebase/auth"
import { setDoc, doc, getDoc } from "firebase/firestore"
import { deleteCookie, setCookie } from "cookies-next"




// ========================================
// STEP 1 : Signin
// ========================================
export const signupWithEmailPass = (user: User, redirect: string | null) => {

    return async (dispatch: AppDispatch) => {
        // console.log("User received", user)

        try {
            dispatch(SIGNUP_STARTED())

            const createUser = await createUserWithEmailAndPassword(auth, user?.email, user?.password)

            //* Adding displayname property for the current user who has just Signup
            if (auth.currentUser && user) {
                await updateProfile(auth.currentUser, { displayName: `${user.firstName} ${user.lastName}` })
            }
            // console.log("User created successfully in auth", createUser)


            //* Email verfication if user successfully signup
            //! Dispatch the verifyingEmail thunk action
            if (createUser.user) {
                await dispatch(verifyingEmail(redirect ? redirect : '/'))
            }



            //* creating user to add in DB
            let UserForDB = {
                full_name: createUser.user.displayName,
                email: user?.email,
                uid: createUser.user.uid,
                createdAt: new Date().toISOString()
            }


            //* adding user to DB
            let userToDB = await setDoc(doc(db, "Users", createUser.user.uid), UserForDB) // adding a section of name "Users" in which each user will be added with a its unique id 
            // console.log("User added to Database")                                 // i.e in firestore(db) -> /Users/userid/actuallUser



            dispatch(SIGNUP_COMPLETED(UserForDB))
            dispatch(VERIFICATION_EMAIL_SENT()) // adding this to end so that once the loading completed then new email verfication page will show when this action dispatch


            // await signOut(auth)

            return true

        } catch (err: any) {
            // console.log("ERROR", err.code, err.message)
            dispatch(SIGNUP_FAILURE())
            return { success: false, error: err.code || err.message }
        }
    }


}






// ========================================
// STEP 2 : verify Email
// ========================================
export const verifyingEmail = (redirect: string) => {
    return async () => {
        const user = auth.currentUser; //! GET USER DIRECTLY FROM AUTH
        // console.log("redirect", redirect)

        try {
            if (!user) {
                // console.log("❌ No current user to send verification to");
                return { success: false, error: 'no-user' };
            }

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const url = redirect !== '/' ?
                `${baseUrl}/signin?redirect=${encodeURIComponent(redirect)}`
                : `${baseUrl}/signin`

            const actionObject = {
                url: url, //! Redirects here after verification
                handleCodeInApp: true
            }

            await sendEmailVerification(user, actionObject)
            // console.log("✅ Email sent!")
            return { success: true };

        } catch (err: any) {
            // console.log("❌ Error sending email:", err)

            //! Handle specific Firebase errors
            if (err.code === 'auth/too-many-requests' || err.message === 'auth/too-many-requests') {
                return { success: false, error: 'too-many-requests' };
            }

            return { success: false, error: err.code || err.message || 'unknown' };
        }
    }
}





// ========================================
// STEP 3 : Login
// ========================================
export const signin = (user: { email: string, password: string }) => {

    return async (dispatch: AppDispatch) => {

        try {
            dispatch(LOGIN_STARTED())

            let loginUer = await signInWithEmailAndPassword(auth, user.email, user.password)
            // console.log('User has logging successfully', loginUer)

            //! SET COOKIE IMMEDIATELY after login, BEFORE AuthProvider's onAuthStateChanged runs
            //! This fixes the timing issue where AuthProvider checks cookie before it's set
            if (loginUer.user.emailVerified) {
                // console.log("✅ Email verified, setting cookie...")
                setCookie("Auth-cookie", loginUer.user.refreshToken, { maxAge: (60 * 60) / 2 });

                dispatch(LOGIN_COMPLETED({
                    full_name: loginUer.user.displayName,
                    email: user.email,
                    uid: loginUer.user.uid,
                }));

                dispatch(VERIFICATION_EMAIL_COMPLETED())
                return true

            } else {
                throw new Error("Please verify your email")
            }


        } catch (err: any) {

            // console.log("ERROR FROM LOGIN", err.code, err.message)
            dispatch(LOGIN_FAILURE())
            return { success: false, error: err.code || err.message }
        }


    }

}




// ========================================
// STEP 4 : Reset Password
// ========================================
export const reset_Password = (email: string, redirect: string) => {

    return async (dispatch: AppDispatch) => {

        try {
            // console.log("Attempting to send reset password email to:", email)

            // After creating new password user will be redirected to here
            // we can not send user to custom url for changing there password we must need to do that on firebase
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const url = redirect !== '/' ?
                `${baseUrl}/signin?redirect=${encodeURIComponent(redirect)}`
                : `${baseUrl}/signin`


            // Configure the action URL to redirect to our custom page
            const actionCodeSettings = {
                url: url,
                handleCodeInApp: true
            }

            await sendPasswordResetEmail(auth, email, actionCodeSettings)
            // console.log("Password reset email sent successfully!")

            // dispatch(RESET_PASSSWORD_EMAIL_SENT())
            return { success: true }


        } catch (err: any) {
            // console.log("❌ Error sending reset email:", err)

            if (err.code === 'auth/too-many-requests' || err.message === 'auth/too-many-requests') {
                return { success: false, error: 'too-many-requests' };
            }

            return { success: false, error: err.code };

        }
    }

}







//! This feature can not worked with firebase auth
// ========================================
// STEP 5: Confirm Reset Password
// ========================================

// export function confirm_Password_Reset(oobCode: string | null, newPassword: string) {

//     return async () => {

//         try {

//             if (oobCode) {
//                 let result = await confirmPasswordReset(auth, oobCode, newPassword)

//                 // console.log("✅ Firebase accepted the reset request.", result);
//                 return { success: true }
//             } else {
//                 // console.log("❌ No oobCode provided!");
//             }

//         } catch (error: any) {

//             // console.log("❌ ERROR in reset:", error);
//             if (error.code === 'auth/too-many-requests' || error.message === 'auth/too-many-requests') {
//                 return { success: false, error: 'too-many-requests' };
//             }

//             return { success: false, error: error.code || error.message }

//         }

//     }

// }




//! sending user to custom url
// const url = redirect !== '/' ?
//     `http://localhost:3000/confirmResetPassword?redirect=${encodeURIComponent(redirect)}`
//     : 'http://localhost:3000/confirmResetPassword'






// ======================================================================================================================== 
//? Social Media Auth - Unified Function
// ========================================================================================================================

// Type for supported social auth providers
type SocialAuthProvider = 'google' | 'facebook' | 'twitter' | 'github';

// Helper function to get the correct provider instance
const getAuthProvider = (providerType: SocialAuthProvider) => {
    switch (providerType) {
        case 'google':
            return new GoogleAuthProvider();
        case 'facebook':
            return new FacebookAuthProvider();
        case 'twitter':
            return new TwitterAuthProvider();
        case 'github':
            return new GithubAuthProvider();
        default:
            throw new Error(`Unsupported provider: ${providerType}`);
    }
};

// Unified Social Auth Function
export function socialAuth(providerType: SocialAuthProvider) {
    return async (dispatch: AppDispatch) => {
        const providerName = providerType.charAt(0).toUpperCase() + providerType.slice(1);

        try {
            dispatch(LOGIN_STARTED({ isSocial: true }))
            // console.log(`🔵 ${providerName} authentication started`)

            const provider = getAuthProvider(providerType);

            // Force account chooser for all providers
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // Check if user exists in database
            const userDocRef = doc(db, "Users", user.uid)
            const userSnapShot = await getDoc(userDocRef)

            let userDataForRedux;

            // If user doesn't exist in DB, create new entry
            if (!userSnapShot.exists()) {
                // console.log(`🆕 New ${providerName} User detected. Saving to DB...`);

                userDataForRedux = {
                    full_name: user.displayName || '',
                    email: user?.email || '',
                    uid: user.uid,
                    createdAt: new Date().toISOString(),
                    authProvider: providerType
                }

                await setDoc(userDocRef, userDataForRedux)
            } else {
                // console.log(`👋 Existing ${providerName} User detected.`);
                userDataForRedux = userSnapShot.data();
            }

            dispatch(LOGIN_COMPLETED({
                full_name: userDataForRedux?.full_name || user.displayName || '',
                email: userDataForRedux?.email || user.email || '',
                uid: userDataForRedux?.uid || user.uid,
                createdAt: userDataForRedux?.createdAt
            }))

            setCookie("Auth-cookie", user.refreshToken, { maxAge: 60 * 60 * 24 }); // 1 Day
            // console.log("🍪 Cookie set, proceeding with Firestore operations...")

            return { success: true }

        } catch (error: any) {
            // console.error(`❌ ${providerName} Auth Error:`, error);
            dispatch(LOGIN_FAILURE())
            return { success: false, message: error.code || error.message }
        }
    }
}





// ================================================================================
//? Creating Acount with Mobile Number
// ================================================================================


declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}



//* 1. Setup the Invisible Recaptcha
// * Before Firebase sends an SMS (which costs money), it requires proof that the user is human.
const setupRecaptcha = () => {

    // Check if the container element exists
    const container = document.getElementById('recaptcha-container');
    if (!container) {
        // console.error("recaptcha-container element not found!");
        return;
    }

    // Clear old verifier to avoid "element removed" error on re-renders
    if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
        } catch (e) {
            // Ignore clear errors
        }
        window.recaptchaVerifier = null;
    }

    // Create fresh RecaptchaVerifier
    // Initialize the "Guard".
    // Arg 1 (auth): Your Firebase connection.
    // Arg 2 ('recaptcha-container'): The ID of a <div> in your HTML where 
    // the captcha logic will live.
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        // 'invisible': The user won't see "I am not a robot" checkbox unless 
        // Google is suspicious. It runs silently in the background.

        'size': 'invisible',

        // This function runs automatically if the user passes the robot check.
        'callback': (response: any) => {
            // console.log("Human verified!");
        },
        'expired-callback': () => {
            // console.log("reCAPTCHA expired");
            window.recaptchaVerifier = null;
        }
    });

}


//* 2 The SMS (OTP)  Sender

export const sendOtp = (phoneNumber: string) => {

    return async (dispatch: AppDispatch) => {
        try {
            // 1. Wake up the Robot Guard defined above.
            setupRecaptcha()

            // 2. Grab the specific verifier instance we just created.
            // Firebase needs this object to approve the SMS request.
            const appVerfier = window.recaptchaVerifier

            // 3. THE BIG STEP: Request the SMS.
            // auth: Your connection.
            // phoneNumber: Must be e.g., "+923001234567". If format is wrong, this fails.
            // appVerifier: The proof that a human is asking for this.
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerfier)

            // 4. Save the "Ticket".
            // 'confirmationResult' is a special object that contains the method 
            // .confirm(otpCode). You MUST save this.
            // We attach it to 'window' here so we can access it in a different function 
            // later (when the user types the code).
            window.confirmationResult = confirmationResult;

            return { success: true, message: "OTP Sent!" };

        } catch (error: any) {

            // console.error("❌ Error sending OTP:", error);
            return { success: false, error: error.code || error.message };


        }
    }

}



//* 3 Verifying OTP
export const verifyOtp = (otpCode: string) => {

    return async (dispatch: AppDispatch) => {
        try {
            // 1. Get confirmationResult from window (saved by sendOtp)
            const confirmationResult = window.confirmationResult;

            if (!confirmationResult) {
                return { success: false, error: 'session-expired' };
            }

            // 2. Verify the OTP code
            const result = await confirmationResult.confirm(otpCode);
            const user = result.user;
            // console.log("✅ Phone Verified. UID:", user.uid);

            // 3. Check if user exists in Firestore
            const userRef = doc(db, "Users", user.uid);
            const userSnapShot = await getDoc(userRef);

            if (!userSnapShot.exists()) {
                // New user - Save phone number and UID immediately
                // console.log(`🆕 New Phone User detected. Saving basic info to DB...`);

                const basicUserData = {
                    uid: user.uid,
                    phoneNumber: user.phoneNumber || '',
                    createdAt: new Date().toISOString(),
                    authProvider: 'phone',
                    profileCompleted: false // Flag to track if profile is complete
                };

                await setDoc(userRef, basicUserData);

                // Return isNewUser: true - component will show CompleteProfile
                return {
                    success: true,
                    isNewUser: true,
                    uid: user.uid,
                    phoneNumber: user.phoneNumber
                };

            } else {
                // Existing user - Login directly
                // console.log(`👋 Existing Phone User detected.`);

                const userData = userSnapShot.data();

                dispatch(LOGIN_COMPLETED({
                    full_name: userData?.full_name || '',
                    email: userData?.email || '',
                    uid: user.uid,
                    createdAt: userData?.createdAt
                }));

                setCookie("Auth-cookie", user.refreshToken, { maxAge: 60 * 60 * 24 }); // 1 Day
                // console.log("🍪 Cookie set for existing phone user");

                return { success: true, isNewUser: false };
            }

        } catch (error: any) {
            // console.error("❌ Error verifying OTP:", error);
            return { success: false, error: error.code || error.message };
        }
    }
}






// ================================================================================
//? SignOut
// ================================================================================



export const sign_Out = () => {
    return async (dispatch: AppDispatch) => {
        try {
            await signOut(auth);
            dispatch(LOGOUT());
            deleteCookie("Auth-cookie");
            // console.log("✅ User signed out successfully");
            return { success: true };
        } catch (error: any) {
            // console.error("❌ Error signing out:", error);
            return { success: false, error: error.code || error.message };
        }
    }
}