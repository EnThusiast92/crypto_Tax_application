
'use client';

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
  { name: 'Visa', src: '/assets/visa.svg', width: 64, height: 40 },
  { name: 'Mastercard', src: '/assets/mastercard.svg', width: 64, height: 40 },
  { name: 'PayPal', src: '/assets/paypal.svg', width: 64, height: 40 },
  { name: 'Bitcoin', src: 'https://i.imgur.com/k2GwhT0.png', width: 32, height: 32, unoptimized: true },
  { name: 'Ethereum', src: '/assets/ethereum.svg', width: 64, height: 40 },
  { name: 'USDT', src: '/assets/usdt.svg', width: 64, height: 40 },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
        {paymentMethods.map((method) => (
          <div key={method.name} className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src={method.src}
              alt={`${method.name} logo`}
              width={method.width}
              height={method.height}
              className="object-contain"
              unoptimized={!!method.unoptimized}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-2">
        Icons by Flaticon.
      </p>
    </div>
  );
}
