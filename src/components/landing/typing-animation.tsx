
'use client';

import { useState, useEffect, useRef } from 'react';
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % texts.length;
      const fullText = texts[i];

      if (isDeleting) {
        setText((prev) => prev.substring(0, prev.length - 1));
      } else {
        setText((prev) => fullText.substring(0, prev.length + 1));
      }
    };

    timeoutRef.current = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isDeleting, loopNum, texts, typingSpeed, deletingSpeed]);
  
  useEffect(() => {
    const i = loopNum % texts.length;
    const fullText = texts[i];

    if (!isDeleting && text === fullText) {
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, delay);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setLoopNum((prev) => prev + 1);
    }
    
    return () => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
  }, [text, isDeleting, delay, loopNum, texts.length]);


  return (
    <span
      className={cn('inline-block border-r-2 border-r-transparent caret-blink', className)}
      dangerouslySetInnerHTML={{ __html: text + '&nbsp;' }}
    />
  );
}
