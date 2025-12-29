'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store/store'
import { sign_Out } from '@/redux/actions/authActions'
import { useRouter } from 'next/navigation'
import { getCookie } from 'cookies-next'

const SignOut = () => {

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Check if user is logged in via cookie
    const hasAuthCookie = getCookie("Auth-cookie")

    const handleSignOut = async () => {
        try {
            setIsLoading(true)
            const response = await dispatch(sign_Out())

            if (response.success) {
                // console.log("Sign out successfully")
                setOpen(false) // Close dialog
                router.push('/signin') // Redirect to signin page
            }
        } catch (error) {
            // console.error("Error signing out:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Hide SignOut button if no auth cookie
    if (!hasAuthCookie) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Sign Out</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSignOut} disabled={isLoading}>
                        {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SignOut