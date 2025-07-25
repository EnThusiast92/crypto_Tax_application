
'use client';

import { useState, useEffect } from 'react';
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
  const [typingTimeout, setTypingTimeout] = useState(typingSpeed);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const handleTyping = () => {
      const i = loopNum % texts.length;
      const fullText = texts[i];

      if (isDeleting) {
        setText(currentText => fullText.substring(0, currentText.length - 1));
        setTypingTimeout(deletingSpeed);
      } else {
        setText(currentText => fullText.substring(0, currentText.length + 1));
        setTypingTimeout(typingSpeed);
      }

      if (!isDeleting && text === fullText) {
        // Pause at the end of typing
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(currentLoop => currentLoop + 1);
      }
    };
    
    const timer = setTimeout(handleTyping, typingTimeout);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, texts, typingSpeed, deletingSpeed, delay, typingTimeout]);
  
  // Set initial text only once
  useEffect(() => {
    if(texts && texts.length > 0 && loopNum === 0) {
      setText(texts[0].substring(0, 1));
    }
  }, [texts, loopNum]);


  return (
    <span
      className={cn('inline-block border-r-2 border-r-transparent caret-blink', className)}
      dangerouslySetInnerHTML={{ __html: text + '&nbsp;' }}
    />
  );
}
