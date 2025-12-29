interface User {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

interface StateUser {
    full_name: string,
    email: string,
    password?: string,
    uid: string,
    createdAt?: typeof Date
}

interface Error {
    [key: string]: boolean
}


interface AuthState {
    user: StateUser | null,
    loading: boolean,
    error: boolean | string,
    emailSent: boolean,
    resetPass: boolean,
    isSocialLoading: boolean  // Distinguishes social auth (button spinner) from regular auth (full overlay)
}


export type { User, Error, AuthState, StateUser }



