
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

    if (isDeleting) {
      setText(currentText => fullText.substring(0, currentText.length - 1));
    } else {
      setText(currentText => fullText.substring(0, currentText.length + 1));
    }

    if (!isDeleting && text === fullText) {
      setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setLoopNum(currentLoop => (currentLoop + 1));
    }
  }, [isDeleting, text, loopNum, texts, delay]);

  useEffect(() => {
    if (!texts || texts.length === 0) return;
    
    const timer = setTimeout(
      () => {
        handleTyping();
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [text, isDeleting, texts, typingSpeed, deletingSpeed, handleTyping]);
  
  // Set initial text
  useEffect(() => {
    if(texts && texts.length > 0) {
      setText(texts[0].substring(0, 1));
    }
  }, [texts]);

  return (
    <span
      className={cn('inline-block border-r-2 border-r-transparent caret-blink', className)}
      dangerouslySetInnerHTML={{ __html: text + '&nbsp;' }}
    />
  );
}
