"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

interface CountdownTimerProps {
  deadline: Date | string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(deadline: Date): TimeLeft {
  const now = new Date();
  const diffInSeconds = differenceInSeconds(deadline, now);

  if (diffInSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diffInSeconds / (60 * 60 * 24));
  const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
  const seconds = diffInSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
  const deadlineDate = new Date(deadline);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(deadlineDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadlineDate);
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineDate, onExpire]);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isExpired) {
    return (
      <div className="text-destructive font-semibold">Deadline passed</div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div
      className={`flex gap-2 text-lg font-mono ${
        isUrgent ? "text-destructive" : ""
      }`}
    >
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.days}</span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-xs text-muted-foreground">hrs</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-xs text-muted-foreground">min</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-xs text-muted-foreground">sec</span>
      </div>
    </div>
  );
}
