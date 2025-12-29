
import { AppDispatch } from "../store/store";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { LOGIN_COMPLETED } from "../reducers/authReducer";
import { setCookie } from "cookies-next";

//* 4 Save Phone User Profile (for new users after verification)
export const savePhoneUserProfile = (uid: string, firstName: string, lastName: string, email?: string) => {

    return async (dispatch: AppDispatch) => {
        try {

            const currentUser = auth.currentUser;

            const userRef = doc(db, "Users", uid);

            const fullName = `${firstName} ${lastName}`;

            if (currentUser) {
                await updateProfile(currentUser, { displayName: `${fullName}` })
            }

            // Update user document with profile info
            await setDoc(userRef, {
                full_name: currentUser?.displayName,
                email: email || '',
                profileCompleted: true
            }, { merge: true }); // merge: true keeps existing fields

            // console.log("✅ Phone user profile saved to Firestore");

            // Dispatch login completed
            dispatch(LOGIN_COMPLETED({
                full_name: fullName,
                email: email || '',
                uid: uid,
                createdAt: new Date().toISOString()
            }));

            // Set auth cookie - get current user's refresh token
            if (currentUser) {
                setCookie("Auth-cookie", currentUser.refreshToken, { maxAge: 60 * 60 * 24 }); // 1 Day
            }

            // console.log("🍪 Cookie set for new phone user");

            return { success: true };

        } catch (error: any) {
            // console.error("❌ Error saving phone user profile:", error);
            return { success: false, error: error.code || error.message };
        }
    }
}
