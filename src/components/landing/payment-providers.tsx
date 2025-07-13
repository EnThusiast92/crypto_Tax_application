
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faBitcoin,
  faEthereum,
} from '@fortawesome/free-brands-svg-icons';

const SolanaIcon = () => (
    <svg role="img" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
            <linearGradient id="solana_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgb(0, 255, 163)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(220, 31, 255)', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <path d="M68.32,382.52,214,44.25a12.33,12.33,0,0,1,22.86-1.5L382.52,316.09a12.33,12.33,0,0,1-10.77,18.5H233.91L83.14,378.84A12.33,12.33,0,0,1,68.32,382.52Z" fill="url(#solana_gradient)"></path>
        <path d="M331.68,17.48,186,271.75a12.33,12.33,0,0,1-22.86,1.5L17.48,83.91a12.33,12.33,0,0,1,10.77-18.5H166.09L316.86,21.16A12.33,12.33,0,0,1,331.68,17.48Z" fill="url(#solana_gradient)"></path>
        <path d="M122.4,147.23,243.66,111.14a12.33,12.33,0,0,1,13.6,9.54l36.3,121.24a12.33,12.33,0,0,1-9.54,13.6L162.75,291.6a12.33,12.33,0,0,1-13.6-9.54L112.85,160.82A12.33,12.33,0,0,1,122.4,147.23Z" fill="#000000"></path>
    </svg>
);


const paymentMethods = [
  { name: 'Visa', icon: faCcVisa },
  { name: 'Mastercard', icon: faCcMastercard },
  { name: 'PayPal', icon: faCcPaypal },
  { name: 'Bitcoin', icon: faBitcoin },
  { name: 'Ethereum', icon: faEthereum },
  { name: 'Solana', icon: SolanaIcon },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4 text-3xl text-gray-400">
        {paymentMethods.map((method) => (
          <div key={method.name} className="opacity-80 hover:opacity-100 transition-opacity flex items-center h-8 w-12">
            {typeof method.icon === 'function' ? <method.icon /> : <FontAwesomeIcon icon={method.icon} />}
          </div>
        ))}
      </div>
    </div>
  );
}
