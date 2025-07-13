
'use client';

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
  { name: 'Visa', src: '/assets/visa.svg' },
  { name: 'Mastercard', src: '/assets/mastercard.svg' },
  { name: 'PayPal', src: '/assets/paypal.svg' },
  { name: 'Bitcoin', src: '/assets/bitcoin.svg' },
  { name: 'Ethereum', src: '/assets/ethereum.svg' },
  { name: 'USDT', src: '/assets/usdt.svg' },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
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
      <p className="text-xs text-muted-foreground/50 mt-2">
        Icons by <a href="https://www.flaticon.com" title="flaticon" className="hover:underline">Flaticon</a>
      </p>
    </div>
  );
}
