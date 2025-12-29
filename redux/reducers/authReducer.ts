import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from '@/types'

const initialState: AuthState = {
    user: null,
    loading: false,
    error: false,
    emailSent: false,
    resetPass: true,
    isSocialLoading: false  // Distinguishes social auth (button spinner) from regular auth (full overlay)
}

const authSlice = createSlice({
    name: 'auth',
    initialState,

    reducers: {

        // --- SIGNUP ACTIONS ---
        SIGNUP_STARTED: (state) => {
            // console.log('SIGNUP STARTED REDUCER')
            state.loading = true
            state.error = false
            state.isSocialLoading = false
        },

        SIGNUP_COMPLETED: (state, action) => {
            // console.log('SIGNUP COMLETED REDUCER')
            state.loading = false
            state.error = false
            state.user = action.payload
            state.isSocialLoading = false
        },

        SIGNUP_FAILURE: (state) => {
            // console.log('SIGNUP FAILED REDUCER')
            state.loading = false
            state.isSocialLoading = false
        },



        // --- LOGIN ACTIONS ---
        LOGIN_STARTED: (state, action: PayloadAction<{ isSocial?: boolean } | undefined>) => {
            // console.log('LOGIN STARTED REDUCER', action.payload?.isSocial ? '(Social)' : '(Regular)')
            state.loading = true
            state.error = false
            state.isSocialLoading = action.payload?.isSocial || false
        },

        LOGIN_COMPLETED: (state, action) => {
            // console.log('LOGIN COMPLETED REDUCER')
            state.loading = false
            state.error = false
            state.user = action.payload // Save user data here too
            state.isSocialLoading = false
        },

        LOGIN_FAILURE: (state) => {
            // console.log('LOGIN FAILURE REDUCER')
            state.loading = false
            state.isSocialLoading = false
        },



        // --- EMAIL VERIFICATION

        VERIFICATION_EMAIL_SENT: (state) => {
            // console.log('EMAIL SENT REDUCER');
            state.emailSent = true; // This triggers your UI to show the success message

        },


        VERIFICATION_EMAIL_COMPLETED: (state) => {
            // console.log('EMAIL VERIFICATION COMPLETED');
            state.emailSent = false; // This triggers your UI to show the success message
        },


        // LOGOUT
        LOGOUT: (state) => {
            // console.log("logout")
            state.user = null
            state.loading = false
            state.error = false
            // state.emailSent = false
        },




    }
})


export default authSlice.reducer

export const {
    SIGNUP_STARTED,
    SIGNUP_COMPLETED,
    SIGNUP_FAILURE,
    LOGIN_STARTED,
    LOGIN_COMPLETED,
    LOGIN_FAILURE,
    VERIFICATION_EMAIL_SENT,
    VERIFICATION_EMAIL_COMPLETED,
    LOGOUT,
} = authSlice.actions