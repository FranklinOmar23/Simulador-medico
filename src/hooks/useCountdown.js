// src/hooks/useCountdown.js

import { useState, useEffect } from 'react';

// Cuenta regresiva en segundos; se detiene cuando running es false
export default function useCountdown(seconds, running) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  return timeLeft;
}
