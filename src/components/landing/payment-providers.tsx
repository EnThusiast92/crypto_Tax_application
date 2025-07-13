
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

// USDT doesn't have a direct brand icon, so we'll represent it cleanly.
const UsdtIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current">
        <title>Tether</title>
        <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zM9.513 6.332h4.974v2.487h-1.89v8.086h-1.195V8.819h-1.89V6.332z" />
    </svg>
);

const paymentMethods = [
  { name: 'Visa', icon: faCcVisa },
  { name: 'Mastercard', icon: faCcMastercard },
  { name: 'PayPal', icon: faCcPaypal },
  { name: 'Bitcoin', icon: faBitcoin },
  { name: 'Ethereum', icon: faEthereum },
  { name: 'USDT', icon: UsdtIcon },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4 text-3xl text-gray-400">
        {paymentMethods.map((method) => (
          <div key={method.name} className="opacity-80 hover:opacity-100 transition-opacity flex items-center h-8">
            {typeof method.icon === 'function' ? (
              <method.icon />
            ) : (
              <FontAwesomeIcon icon={method.icon} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
