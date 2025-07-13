
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';

const paymentMethods = [
  { name: 'Visa', icon: fab.faCcVisa },
  { name: 'Mastercard', icon: fab.faCcMastercard },
  { name: 'PayPal', icon: fab.faCcPaypal },
  { name: 'Bitcoin', icon: fab.faBitcoin },
  { name: 'Ethereum', icon: fab.faEthereum },
];

export function PaymentProviders() {
  return (
    <div className="flex flex-col items-center md:items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</h3>
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-4 text-3xl text-gray-400">
        {paymentMethods.map((method) => (
          <div key={method.name} className="opacity-80 hover:opacity-100 transition-opacity flex items-center h-8 w-12">
            <FontAwesomeIcon icon={method.icon} />
          </div>
        ))}
      </div>
    </div>
  );
}
