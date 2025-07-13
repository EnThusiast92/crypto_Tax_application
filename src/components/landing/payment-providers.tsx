
'use client';

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
  { name: 'Visa', iconUrl: 'https://i.imgur.com/3_SY5x2.png', width: 60, height: 20 },
  { name: 'Mastercard', iconUrl: 'https://i.imgur.com/i9a5s_3.png', width: 40, height: 24 },
  { name: 'PayPal', iconUrl: 'https://i.imgur.com/c4_Q2c1.png', width: 80, height: 22 },
  { name: 'Bitcoin', iconUrl: 'https://i.imgur.com/C_Y61eX.png', width: 24, height: 24 },
  { name: 'Ethereum', iconUrl: 'https://i.imgur.com/r_UNd5S.png', width: 24, height: 24 },
  { name: 'USDT', iconUrl: 'https://i.imgur.com/B_SjD4h.png', width: 24, height: 24 },
];


export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4">
        {paymentMethods.map((method) => (
          <div key={method.name} className="opacity-80 hover:opacity-100 transition-opacity flex items-center h-6">
            <Image 
              src={method.iconUrl} 
              alt={`${method.name} logo`} 
              width={method.width}
              height={method.height}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
