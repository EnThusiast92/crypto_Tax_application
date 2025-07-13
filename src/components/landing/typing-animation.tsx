
'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delay?: number;
}

export function TypingAnimation({
  texts,
  className,
  typingSpeed = 100,
  deletingSpeed = 50,
  delay = 2000,
}: TypingAnimationProps) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const handleTyping = useCallback(() => {
    const i = loopNum % texts.length;
    const fullText = texts[i];

    setText(
      isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
    );

    if (!isDeleting && text === fullText) {
      setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }
  }, [isDeleting, text, loopNum, texts, delay]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        handleTyping();
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [text, handleTyping, isDeleting, deletingSpeed, typingSpeed]);

  return (
    <p className={cn('inline-block border-r-2 border-r-transparent caret-blink', className)}>
      {text}&nbsp;
    </p>
  );
}
