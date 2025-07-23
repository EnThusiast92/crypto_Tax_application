# TaxWise Crypto - Project Status

This document provides a high-level overview of the current state of the TaxWise Crypto application, including implemented features and known areas for improvement.

## ✅ Implemented Features

### 1. Core Platform & Authentication
- **User Authentication:** Robust system allowing users to register, log in, and log out. Supports both email/password and Google Sign-In.
- **Role-Based Access Control (RBAC):** The application supports four distinct user roles, each with a dedicated dashboard and permissions:
    - **Client:** The standard user who tracks their crypto transactions.
    - **TaxConsultant:** Can be invited by clients to view their data.
    - **Staff:** An internal role with permissions managed by a Developer.
    - **Developer:** Has full access to user management and application settings.
- **Authenticated Shell:** A clean, consistent UI shell for all logged-in users, with navigation links dynamically adjusted based on user role.

### 2. Transaction Management
- **Manual Entry:** Users can manually add transactions, including complex types like 'Swap'.
- **CSV Import:** A functional CSV uploader allows users to import transactions from exchanges. The system includes a basic data normalization layer.
- **Transaction View:** A comprehensive and interactive table displays all user transactions, featuring sorting, filtering, and pagination.
- **Expandable Details:** Users can click on a transaction row to view more detailed information without leaving the page.

### 3. Crypto Asset Icons
- **Hybrid Loading Strategy:** The app uses a robust, two-tiered system for loading crypto icons:
    - **Build-Time Cache:** The top 300 crypto icons are pre-fetched and stored locally in a JSON file, ensuring instantaneous loading for the most common assets.
    - **Dynamic Fallback:** For any asset not in the pre-fetched list (e.g., a newly added transaction for a less common coin), the app automatically fetches the icon from the CoinGecko API at runtime.

### 4. AI-Powered Features
- **Transaction Classifier:** An AI-driven feature (`/classifier`) that analyzes a user's transactions, identifies potential misclassifications, and suggests corrections with a confidence score. This is powered by a Genkit flow.

### 5. User & Admin Management
- **Settings Page:** Users can manage their profile information. Clients can use this page to invite a tax consultant, view pending invites, and revoke access.
- **Consultant Dashboard:** Tax consultants have a dedicated dashboard to view their active clients and manage pending invitations.
- **Developer Dashboard:** A powerful admin panel for developers to manage all users, change roles, and configure site-wide application settings and feature toggles.
- **Staff Dashboard:** A dashboard for internal staff with permissions that can be dynamically controlled from the Developer dashboard.

## Areas for Improvement & Next Steps

- **Performance:** While initial data loading has been optimized, further improvements can be made, especially for users with very large transaction histories.
- **Tax Report Generation:** The UI for generating tax reports exists, but the core calculation logic is currently placeholder. The next major step would be to implement the business logic for calculating gains/losses according to UK tax law.
- **API Sync:** The UI toggle for API Sync with exchanges is present but disabled. This feature needs to be built out.
- **UI/UX Polish:** General enhancements can be made across the app to improve user experience, such as adding more loading states, refining form validation, and improving accessibility.