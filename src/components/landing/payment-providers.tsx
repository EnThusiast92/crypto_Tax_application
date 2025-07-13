
'use client';

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
  { name: 'Visa', src: 'https://i.imgur.com/J8h2iMh.png' },
  { name: 'Mastercard', src: 'https://i.imgur.com/9lH2vYt.png' },
  { name: 'PayPal', src: 'https://i.imgur.com/Ikw3A1M.png' },
  { name: 'Bitcoin', src: 'https://i.imgur.com/b9e281A.png' },
  { name: 'Ethereum', src: 'https://i.imgur.com/DftTj4V.png' },
  { name: 'Solana', src: 'https://i.imgur.com/kM05gEN.png' },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4">
        {paymentMethods.map((method) => (
          <div key={method.name} className="relative h-8 w-12 opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Image
              src={method.src}
              alt={`${method.name} logo`}
              width={48}
              height={32}
              className="object-contain"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
