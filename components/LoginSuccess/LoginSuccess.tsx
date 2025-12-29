"use client";
import { useEffect, useState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";

interface LoginSuccessProps {
    userName?: string;
    redirectPath?: string;
    onComplete: () => void;
    delayMs?: number;
}

const LoginSuccess = ({
    userName = "User",
    redirectPath = "/",
    onComplete,
    delayMs = 9000
}: LoginSuccessProps) => {

    const [countdown, setCountdown] = useState(Math.ceil(delayMs / 1000));

    useEffect(() => {
        // Countdown timer for display
        const countdownTimer = setInterval(() => {
            setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        // Auto-redirect after delay
        const redirectTimer = setTimeout(() => {
            onComplete();
        }, delayMs);

        return () => {
            clearInterval(countdownTimer);
            clearTimeout(redirectTimer);
        };
    }, [delayMs, onComplete]);

    // Extract first name for display
    const firstName = userName?.split(" ")[0] || "User";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">

                {/* Animated Success Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        {/* Pulse animation */}
                        <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-30 dark:bg-green-800"></div>
                        {/* Success checkmark */}
                        <IconCircleCheck className="relative h-14 w-14 text-green-600 dark:text-green-400 animate-bounce" />
                    </div>
                </div>

                {/* Welcome Message */}
                <h2 className="mb-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                    Welcome : {firstName}!
                </h2>

                <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                    You have logged in successfully
                </p>

                {/* Redirect Info */}
                <div className="rounded-lg bg-neutral-100 p-4 dark:bg-zinc-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Redirecting you to{" "}
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {redirectPath === "/" ? "Home" : redirectPath}
                        </span>
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-zinc-700">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear"
                            style={{
                                width: "100%",
                                animation: `shrink ${delayMs}ms linear forwards`
                            }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                        in {countdown} second{countdown !== 1 ? "s" : ""}...
                    </p>
                </div>

                {/* Manual redirect option */}
                <button
                    onClick={onComplete}
                    className="mt-4 text-sm text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Click here if not redirected
                </button>
            </div>

            {/* CSS for shrink animation */}
            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export default LoginSuccess;
