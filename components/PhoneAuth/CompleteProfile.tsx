"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { LabelInputContainer, BottomGradient } from "@/components/ui/signup-form-demo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/redux/store/store'
import { savePhoneUserProfile } from '@/redux/actions/userActions'
import { IconRefresh, IconAlertCircle, IconX } from "@tabler/icons-react";

interface CompleteProfileProps {
    uid: string;
    phoneNumber: string;
    redirect: string;
}

const CompleteProfile = ({ uid, phoneNumber, redirect }: CompleteProfileProps) => {

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })
    const [errors, setErrors] = useState<{ firstName?: boolean; lastName?: boolean }>({})
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // Validate required fields
        const newErrors: { firstName?: boolean; lastName?: boolean } = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = true;
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const result = await dispatch(savePhoneUserProfile(
                uid,
                formData.firstName.trim(),
                formData.lastName.trim(),
                formData.email.trim() || undefined
            ));

            if (result.success) {
                // Clear localStorage and redirect
                localStorage.removeItem("phoneAuthPhone");
                localStorage.removeItem("phoneAuthOtpSent");
                localStorage.removeItem("phoneOtpCooldownEnd");
                localStorage.removeItem("phoneAuthNewUser");
                localStorage.removeItem("phoneAuthUid");

                router.push(redirect);
            } else {
                setErrorMessage("Failed to save profile. Please try again.");
            }

        } catch (error: any) {
            // console.error("Error saving profile:", error);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    const clearError = (field: string) => {
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    return (
        <form className="mt-8 mb-3" onSubmit={handleSubmit}>
            {/* First Name */}
            <LabelInputContainer className="mb-4">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                    id="firstName"
                    placeholder="John"
                    type="text"
                    value={formData.firstName}
                    className={`${errors.firstName ? 'animate-shake ring-2 ring-red-500' : ''}`}
                    onFocus={() => clearError('firstName')}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                        Please enter your first name
                    </p>
                )}
            </LabelInputContainer>

            {/* Last Name */}
            <LabelInputContainer className="mb-4">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                    id="lastName"
                    placeholder="Doe"
                    type="text"
                    value={formData.lastName}
                    className={`${errors.lastName ? 'animate-shake ring-2 ring-red-500' : ''}`}
                    onFocus={() => clearError('lastName')}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                        Please enter your last name
                    </p>
                )}
            </LabelInputContainer>

            {/* Email (Optional) */}
            <LabelInputContainer className="mb-6">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                    id="email"
                    placeholder="john@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-neutral-500 text-xs mt-1">
                    You can add an email for account recovery
                </p>
            </LabelInputContainer>

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{errorMessage}</span>
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

            {/* Submit Button */}
            <button
                className="cursor-pointer group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-br from-black to-neutral-600 px-4 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
                type="submit"
                disabled={isSaving}
            >
                {isSaving ? (
                    <IconRefresh className="h-4 w-4 animate-spin" />
                ) : (
                    <span>Complete Profile & Continue</span>
                )}
                <BottomGradient />
            </button>

            {/* Phone Number Display */}
            <p className="mt-4 text-center text-xs text-neutral-500">
                Signed in as {phoneNumber}
            </p>
        </form>
    )
}

export default CompleteProfile;
