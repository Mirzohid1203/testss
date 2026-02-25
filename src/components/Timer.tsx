"use client";

import { useEffect, useState } from "react";
import { Timer as TimerIcon, AlertCircle } from "lucide-react";

interface TimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
    isActive: boolean;
}

export default function Timer({ initialTime, onTimeUp, isActive }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        let interval: any = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            onTimeUp();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isLow = timeLeft < 60;

    return (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xl font-bold transition-colors ${isLow ? "border-red-500/50 bg-red-500/10 text-red-500 animate-pulse" : "border-gray-700 bg-gray-800 text-blue-400"
            }`}>
            {isLow ? <AlertCircle className="h-5 w-5" /> : <TimerIcon className="h-5 w-5" />}
            {formatTime(timeLeft)}
        </div>
    );
}
