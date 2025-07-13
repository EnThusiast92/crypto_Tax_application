
'use client';

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
  { name: 'Visa', src: '/assets/visa.svg', unoptimized: false },
  { name: 'Mastercard', src: 'https://i.imgur.com/7OF2pLg.png', unoptimized: true },
  { name: 'PayPal', src: 'https://i.imgur.com/J8TRh1c.png', unoptimized: true },
  { name: 'Bitcoin', src: 'https://i.imgur.com/k2GwhT0.png', unoptimized: true },
  { name: 'Ethereum', src: 'https://i.imgur.com/D4s2MAV.png', unoptimized: true },
  { name: 'USDT', src: 'https://i.imgur.com/62QCcU3.png', unoptimized: true },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
        {paymentMethods.map((method) => (
          <div key={method.name} className="flex items-center justify-center h-8 opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src={method.src}
              alt={`${method.name} logo`}
              width={48}
              height={32}
              className="object-contain h-full w-auto"
              unoptimized={method.unoptimized}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-2">
        Icons sourced from various platforms.
      </p>
    </div>
  );
}
