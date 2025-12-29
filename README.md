# 🔐 Authentication Flow Documentation

This document explains how the entire authentication system works in this Firebase + Next.js Todo App.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `components/AuthProvider/AuthProvder.tsx` | Listens to Firebase auth state changes, manages session |
| `redux/actions/authActions.ts` | Contains all auth actions (signup, signin, verify email, reset password) |
| `redux/reducers/authReducer.ts` | Redux state for auth (user, loading, error, emailSent) |
| `components/SignupForm/SignupForm.tsx` | Signup form UI |
| `components/SigninForm/SigninForm.tsx` | Signin form UI |
| `components/EmailVerification/EmailVerifcation.tsx` | "Verify your email" page with resend button |
| `proxy.ts` | Route protection logic (needs to be renamed to middleware.ts) |

---

## 🔄 SCENARIO 1: User Signs Up (New User)

### Flow:
```
User fills signup form → Creates Firebase account → Sends verification email → Shows "Verify Email" page
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | `SignupForm.tsx` | 54-103 | User fills form, clicks "Sign up", calls `handleSubmit()` |
| 2 | `SignupForm.tsx` | 95 | Dispatches `signupWithEmailPass(formData, redirect)` |
| 3 | `authActions.ts` | 21-80 | `signupWithEmailPass` action runs |
| 4 | `authActions.ts` | 27 | Dispatches `SIGNUP_STARTED()` → sets `loading: true` |
| 5 | `authActions.ts` | 29 | `createUserWithEmailAndPassword(auth, email, password)` creates Firebase user |
| 6 | `authActions.ts` | 32-34 | `updateProfile()` sets user's display name |
| 7 | `authActions.ts` | 41 | Dispatches `verifyingEmail(redirect)` → sends verification email |
| 8 | `authActions.ts` | 83-113 | `verifyingEmail()` uses `auth.currentUser` to send email |
| 9 | `authActions.ts` | 57 | Adds user to Firestore database |
| 10 | `authActions.ts` | 62-63 | Dispatches `SIGNUP_COMPLETED` and `VERIFICATION_EMAIL_SENT` |
| 11 | `authReducer.ts` | 63-66 | `VERIFICATION_EMAIL_SENT` sets `emailSent: true` |
| 12 | `SignupForm.tsx` | 128-138 | Checks `if(emailSent)` → renders `<EmailVerification />` component |

### Important Notes:
- ❌ We do NOT sign out user after signup (`authActions.ts` line 66 is commented out)
- ✅ This allows resend verification email to work (needs `auth.currentUser`)
- ✅ AuthProvider sees unverified user → does NOT set Redux user (no auto-login)

---

## 🔄 SCENARIO 2: User Clicks "Resend Verification Email"

### Flow:
```
User on "Verify Email" page → Clicks "Resend" → Sends another verification email
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | `EmailVerifcation.tsx` | 73-88 | User clicks "Resend Verification Email" button |
| 2 | `EmailVerifcation.tsx` | 18-31 | `handleResendClick()` calls `onResend()` prop |
| 3 | `SignupForm.tsx` | 120-123 | `handleResend()` dispatches `verifyingEmail(redirect)` |
| 4 | `authActions.ts` | 83-113 | `verifyingEmail()` action runs |
| 5 | `authActions.ts` | 87 | Gets `auth.currentUser` (still exists because we didn't sign out) ✅ |
| 6 | `authActions.ts` | 105 | `sendEmailVerification(user, actionObject)` sends email |
| 7 | `EmailVerifcation.tsx` | 24-26 | Sets `resendStatus: "sent"` → shows "Link Sent!" |

### Why This Works:
- After signup, `auth.currentUser` still exists (we didn't call `signOut`)
- So we can call `sendEmailVerification(auth.currentUser)` to resend

---

## 🔄 SCENARIO 3: User Verifies Email (Clicks Link in Email)

### Flow:
```
User clicks email link → Email verified → Redirected to /signin → Must login manually
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | - | - | User clicks verification link in email |
| 2 | - | - | Firebase marks `emailVerified: true` on user account |
| 3 | - | - | User is redirected to `/signin` (configured in `verifyingEmail` action) |
| 4 | `AuthProvder.tsx` | 15 | `onAuthStateChanged` fires (user landed on app) |
| 5 | `AuthProvder.tsx` | 22-23 | Checks for `Auth-cookie` → NOT FOUND |
| 6 | `AuthProvder.tsx` | 27 | Checks `emailVerified` → TRUE |
| 7 | `AuthProvder.tsx` | 43-48 | Scenario 2: Verified + No Cookie → waits 500ms |
| 8 | `AuthProvder.tsx` | 59-63 | Still no cookie → Forces `signOut(auth)` |
| 9 | `AuthProvder.tsx` | 64 | Dispatches `LOGOUT()` → clears Redux user |
| 10 | - | - | User sees login page, must enter credentials |

### Why We Force Logout:
- Prevents auto-login after verification
- User MUST enter credentials to prove they know the password
- Cookie is only set on manual login

---

## 🔄 SCENARIO 4: User Logs In (Manual Login)

### Flow:
```
User enters credentials → Firebase login → Cookie set → Redux user set → Redirect to destination
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | `SigninForm.tsx` | 49-87 | User fills form, clicks "Login", calls `handleSubmit()` |
| 2 | `SigninForm.tsx` | 74 | Dispatches `signin(formData)` |
| 3 | `authActions.ts` | 119-157 | `signin` action runs |
| 4 | `authActions.ts` | 124 | Dispatches `LOGIN_STARTED()` → sets `loading: true` |
| 5 | `authActions.ts` | 126 | `signInWithEmailAndPassword(auth, email, password)` |
| 6 | `authActions.ts` | 129-133 | If email verified → `setCookie("Auth-cookie", ...)` ⭐ IMPORTANT |
| 7 | `authActions.ts` | 135-139 | Dispatches `LOGIN_COMPLETED({user data})` |
| 8 | `authReducer.ts` | 47-52 | Sets `state.user = payload` |
| 9 | `AuthProvder.tsx` | 15 | `onAuthStateChanged` fires |
| 10 | `AuthProvder.tsx` | 22-23 | Checks for cookie → FOUND ✅ (we just set it) |
| 11 | `AuthProvder.tsx` | 31-37 | Scenario 1: Verified + Cookie → Dispatches `LOGIN_COMPLETED` again |
| 12 | `SigninForm.tsx` | 42-46 | `useEffect` sees `user` in Redux → calls `router.push(redirect)` |
| 13 | - | - | User is redirected to destination page |

### Why Cookie Matters:
- Cookie proves user logged in manually (entered credentials)
- Without cookie, AuthProvider forces logout
- With cookie, AuthProvider restores session

---

## 🔄 SCENARIO 5: User Returns to App (Already Logged In)

### Flow:
```
User opens app → AuthProvider checks Firebase + Cookie → Restores session
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | - | - | User opens app (or refreshes page) |
| 2 | `AuthProvder.tsx` | 15 | `onAuthStateChanged` fires with existing Firebase user |
| 3 | `AuthProvder.tsx` | 22-23 | Checks for `Auth-cookie` → FOUND ✅ |
| 4 | `AuthProvder.tsx` | 27 | Checks `emailVerified` → TRUE |
| 5 | `AuthProvder.tsx` | 31-37 | Scenario 1: Verified + Cookie → `LOGIN_COMPLETED` |
| 6 | - | - | User is logged in, can access protected pages |

---

## 🔄 SCENARIO 6: User Tries to Login Without Verifying Email

### Flow:
```
User enters credentials → Email not verified → Error shown → Signed out
```

### Step-by-Step:

| Step | File | Line | What Happens |
|------|------|------|--------------|
| 1 | `SigninForm.tsx` | 74 | User tries to login, dispatches `signin()` |
| 2 | `authActions.ts` | 126 | `signInWithEmailAndPassword` succeeds |
| 3 | `authActions.ts` | 129 | Checks `emailVerified` → FALSE |
| 4 | `authActions.ts` | 144-145 | Signs out user, throws error "Please verify your email first" |
| 5 | `authActions.ts` | 150 | Dispatches `LOGIN_FAILURE(error)` |
| 6 | `SigninForm.tsx` | 168-175 | Shows error message "Please verify your Email first" |

---

## 🔄 SCENARIO 7: User Logs Out

### Flow:
```
User clicks logout → Firebase signOut → Cookie deleted → Redux cleared
```

### How to implement (if not done yet):
```typescript
// In your logout function:
import { signOut } from "firebase/auth"
import { deleteCookie } from "cookies-next"

const handleLogout = async () => {
    await signOut(auth)           // Signs out from Firebase
    deleteCookie("Auth-cookie")   // Removes the session cookie
    dispatch(LOGOUT())            // Clears Redux state
}
```

---

## 📊 State Diagram

```
                    ┌─────────────────┐
                    │   User Opens    │
                    │      App        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  AuthProvider   │
                    │ onAuthStateChanged│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌───────▼───────┐
    │   No User     │ │ Unverified  │ │   Verified    │
    └───────┬───────┘ └──────┬──────┘ └───────┬───────┘
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌───────▼───────┐
    │    LOGOUT     │ │ Keep for    │ │ Check Cookie  │
    │  Show Login   │ │   Resend    │ │               │
    └───────────────┘ └─────────────┘ └───────┬───────┘
                                              │
                                 ┌────────────┼────────────┐
                                 │                         │
                         ┌───────▼───────┐         ┌───────▼───────┐
                         │  Has Cookie   │         │  No Cookie    │
                         │ (Manual Login)│         │   (Auto)      │
                         └───────┬───────┘         └───────┬───────┘
                                 │                         │
                         ┌───────▼───────┐         ┌───────▼───────┐
                         │LOGIN_COMPLETED│         │ Force SignOut │
                         │ Restore User  │         │  Show Login   │
                         └───────────────┘         └───────────────┘
```

---

## 🍪 Cookie Explained

| State | Cookie Exists? | What Happens |
|-------|---------------|--------------|
| After Signup | ❌ No | User not logged in, can resend verification |
| After Verification | ❌ No | AuthProvider forces logout, must login manually |
| After Manual Login | ✅ Yes | AuthProvider restores session |
| After Logout | ❌ No | Cookie deleted |

---

## ⚠️ Known Issues / TODOs

1. **proxy.ts should be middleware.ts**: The route protection file `proxy.ts` needs to be renamed to `middleware.ts` and placed in the project root for Next.js middleware to work.

2. **Cookie expiry**: Currently set to 30 minutes (`maxAge: (60 * 60) / 2`). Adjust as needed.

3. **Redirect param**: The `?redirect=` parameter should be preserved throughout the signup → verify → login flow.

---

## 🔧 File Structure

```
├── app/
│   ├── signin/page.tsx          # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── profile/page.tsx         # Protected page example
│   └── layout.tsx               # App layout with providers
├── components/
│   ├── AuthProvider/
│   │   └── AuthProvder.tsx      # ⭐ Auth state listener
│   ├── SignupForm/
│   │   └── SignupForm.tsx       # Signup form with validation
│   ├── SigninForm/
│   │   └── SigninForm.tsx       # Login form with redirect
│   └── EmailVerification/
│       └── EmailVerifcation.tsx # Verify email page with resend
├── redux/
│   ├── actions/
│   │   └── authActions.ts       # ⭐ All auth logic
│   ├── reducers/
│   │   └── authReducer.ts       # Auth state management
│   └── store/
│       └── store.ts             # Redux store config
├── lib/
│   └── firebase.ts              # Firebase config
└── proxy.ts                     # Route protection (rename to middleware.ts)
```
# Authentication-firebase
