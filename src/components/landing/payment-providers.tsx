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
        <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#9945FF'}} />
          <stop offset="100%" style={{stopColor: '#14F195'}} />
        </linearGradient>
      </defs>
      <path d="M68.23 34.84c-3.53-6.1-9.35-8.8-14.88-7.22-5.52 1.58-9.15 6.33-12.68 12.43-3.53 6.1-5.45 11.23-3.87 16.75s6.33 9.15 12.43 12.68c6.1 3.53 11.23 5.45 16.75 3.87 5.53-1.58 9.15-6.33 12.68-12.43 3.53-6.1 5.45-11.23 3.87-16.75s-6.33-9.15-12.43-12.68Zm-4.9 23.32c-3.13 5.4-8.1 7.6-12.85 6.22-4.75-1.37-7.85-5.4-10.98-10.8-3.13-5.4-4.52-10.05-3.15-14.8 1.37-4.75 5.4-7.85 10.8-10.98s10.05-4.52 14.8-3.15c4.75 1.37 7.85 5.4 10.98 10.8 3.13 5.4 4.52 10.05 3.15 14.8-1.37 4.75-5.4 7.85-10.8 10.98Zm-5.3-26.2-1.7 2.94c-3.13-1.8-6.42-2.8-9.74-2.8-5.32 0-9.42 2.2-9.42 6.13 0 2.95 2.1 4.8 4.6 6.03l1.8 1.08c4.27 2.5 7.1 4.8 7.1 9.4 0 5.17-3.8 8.6-10.1 8.6-4.63 0-8.5-1.9-11.37-3.9l-1.6 2.9c3.25 2.2 7.3 3.5 11.8 3.5 6.53 0 11.8-3.2 11.8-9.4 0-3.62-2.2-5.8-5.2-7.5l-1.8-1.08c-3.5-2.1-5.6-3.9-5.6-7.3 0-3.5 2.9-5.4 8.2-5.4 3.7 0 6.9 1 9.6 2.5Z" fill="url(#solana-gradient)"></path>
      <path d="m142.23 75.84-1.7 2.94c-3.13-1.8-6.42-2.8-9.74-2.8-5.32 0-9.42 2.2-9.42 6.13 0 2.95 2.1 4.8 4.6 6.03l1.8 1.08c4.27 2.5 7.1 4.8 7.1 9.4 0 5.17-3.8 8.6-10.1 8.6-4.63 0-8.5-1.9-11.37-3.9l-1.6 2.9c3.25 2.2 7.3 3.5 11.8 3.5 6.53 0 11.8-3.2 11.8-9.4 0-3.62-2.2-5.8-5.2-7.5l-1.8-1.08c-3.5-2.1-5.6-3.9-5.6-7.3 0-3.5 2.9-5.4 8.2-5.4 3.7 0 6.9 1 9.6 2.5Z" fill="#14F195"></path>
      <path d="M189 74h-4.2l-5.6 15.1-5.9-15.1h-4.2l8 20.9h4l8-20.9Z" fill="#14F195"></path>
    </svg>
);

const paymentMethods = [
  { name: 'Visa', icon: faCcVisa },
  { name: 'Mastercard', icon: faCcMastercard },
  { name: 'PayPal', icon: faCcPaypal },
  { name: 'Bitcoin', icon: faBitcoin },
  { name: 'Ethereum', icon: faEthereum },
  { name: 'Solana', icon: SolanaIcon, isComponent: true },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4 text-3xl text-gray-400">
        {paymentMethods.map((method) => (
          <div key={method.name} className="opacity-80 hover:opacity-100 transition-opacity flex items-center h-8">
            {method.isComponent ? <method.icon /> : <FontAwesomeIcon icon={method.icon} />}
          </div>
        ))}
      </div>
    </div>
  );
}
