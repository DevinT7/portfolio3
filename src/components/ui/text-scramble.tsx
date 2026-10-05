'use client';
import { useEffect, useState } from 'react';

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
};

const defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// From motion-primitives' Text Scramble, reworked so the interval lives in one effect with
// cleanup (no setState in the effect body) and renders a plain element.
export function TextScramble({
  children: text,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = 'p',
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!trigger) return;
    const steps = duration / speed;
    let step = 0;

    const interval = setInterval(() => {
      const progress = step / steps;
      let scrambled = '';
      for (let i = 0; i < text.length; i++) {
        scrambled +=
          progress * text.length > i
            ? text[i]
            : characterSet[Math.floor(Math.random() * characterSet.length)];
      }
      setDisplayText(scrambled);
      step++;

      if (step > steps) {
        clearInterval(interval);
        setDisplayText(text);
        onScrambleComplete?.();
      }
    }, speed * 1000);

    return () => {
      clearInterval(interval);
      setDisplayText(text);
    };
  }, [trigger, text, duration, speed, characterSet, onScrambleComplete]);

  return <Component className={className}>{displayText}</Component>;
}
