# Hotel Reservation App

A simple hotel reservation application built with React and Vite.

## Features

- Reservation form with check-in/check-out dates
- Room type selection (Single, Double, Suite)
- Guest information collection
- Reservation confirmation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

To build the app for production:

```bash
npm run build
```

## Stripe Setup

Stripe is supported with a local backend that creates checkout sessions.

1. Add Stripe keys to your environment:
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
2. Start the backend server in one terminal:
   ```bash
   npm run server
   ```
3. Start the app in another terminal:
   ```bash
   npm run dev
   ```
4. Use the Check Out page to pay bookings via Stripe.

## Technologies Used

- React 19
- Vite
- ESLint
