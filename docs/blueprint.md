# **App Name**: TaxWise Crypto

## Core Features:

- Tax Dashboard: Dashboard providing a summary of gains, losses, and taxable income. Display data in tables with sorting and filtering.
- CSV Import: Enable users to upload CSV files from centralized exchanges (CEX) such as Binance and Coinbase. Support normalization of transaction data.
- Tax Report Generator: Tax Report generation based on imported data using UK tax regulations for crypto assets. Filter by year.
- Transaction Classifier: Use an AI tool to scan uploaded data and flag potentially incorrect transaction classifications. Suggest alternate classifications.

## Style Guidelines:

- Primary color: Electric Purple (#7928CA) to convey innovation and modernity in the crypto space.
- Background color: Dark Charcoal (#1E1E1E) to create a sleek, high-tech feel that enhances the vibrancy of other colors.
- Accent color: Neon Green (#39FF14) to draw attention to key interactive elements and CTAs with an energetic pop.
- Body and headline font: 'Roboto' (sans-serif) for a clean, modern, and highly readable text, ensuring clarity on all devices.
- Bold, neon-outlined icons that visually represent transaction types and financial metrics, adding a futuristic touch.
- Dashboard layout using a modular card system, providing a structured and adaptable display across various screen sizes.
- Smooth, animated transitions with a slight parallax effect when loading new data or interacting with elements, enhancing user engagement.

# Wallet Management & Reconciliation

- Connect Wallets: Allow users to connect multiple wallets and exchanges. For on-chain wallets, users input a public address; for CEX wallets, users provide API Key & Secret; alternatively, they can upload CSVs.

- Wallet List View: A /wallets page listing all connected wallets with columns:

- Wallet Name

- Type (DEX or CEX)

- Transactions Count

- Reported Balance

- Live Balance

- Discrepancy (Live – Reported)

- Sync Mechanism: "Sync Now" button on each wallet row to fetch new transactions and update balances using cloud functions (Helius API for on-chain, exchange APIs for CEX).

- Segmentation: Tag all transactions with walletId so users can filter by wallet on the Transactions page.

- Reconciliation: Compare reported balances (sum of imported txs) against live on-chain balances to highlight discrepancies.

- Wallet Detail View: A dynamic /wallets/[id] page showing transactions for a specific wallet, with filters by date, type, and status.

- Scheduled Sync: Background job (Cloud Scheduler) to periodically invoke wallet sync and keep data up to date.