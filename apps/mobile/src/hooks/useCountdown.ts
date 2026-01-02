import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [duration, setDuration] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSecondsLeft(duration);
    hasCompletedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(duration);
      hasCompletedRef.current = false;
    }
    setIsRunning(true);
  }, [duration, secondsLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (nextDuration?: number) => {
      setIsRunning(false);
      hasCompletedRef.current = false;
      if (typeof nextDuration === "number") {
        setDuration(nextDuration);
        setSecondsLeft(nextDuration);
        return;
      }
      setSecondsLeft(duration);
    },
    [duration]
  );

  return {
    duration,
    secondsLeft,
    isRunning,
    setDuration,
    start,
    pause,
    reset,
  };
}
