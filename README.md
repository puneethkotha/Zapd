# Zapd — P2P EV Charging Marketplace

A peer-to-peer EV charging marketplace web app built with Next.js 15, Supabase, Stripe, and Mapbox.

## Features

- **Map & Discovery:** Mapbox-powered map with nearby charging stations, geolocation, and search
- **Station Details:** Connector types, rates, amenities, availability slots
- **Booking Flow:** Multi-step booking with Stripe Checkout
- **Live Sessions:** Real-time charging session tracking
- **Host Dashboard:** Manage stations, slots, earnings
- **Auth:** Supabase auth with Google OAuth and email

## Tech Stack

- Next.js 15, TypeScript, Tailwind v4, Framer Motion
- Supabase (auth, database, RLS)
- Stripe (payments)
- Mapbox (maps)
- TanStack Query, Zustand, React Hook Form, Zod, Radix UI

## Getting Started

1. Clone and install:

   ```bash
   git clone https://github.com/puneethkotha/Zapd.git
   cd Zapd
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and fill in Supabase, Stripe, and Mapbox keys.

3. Run migrations:

   ```bash
   pnpm supabase db push
   ```

4. Start dev server:

   ```bash
   pnpm dev
   ```

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — UI components, map, station, host, session
- `lib/` — Supabase, Stripe, validations, utils
- `supabase/` — Migrations and Edge Functions
- `types/` — Shared TypeScript types

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
