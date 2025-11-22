# Frontend Application

Complete React/Next.js frontend for Bridge API integration.

## Structure

```
frontend/
├── pages/              # Next.js pages
│   ├── onboarding.tsx  # KYC onboarding flow
│   ├── dashboard.tsx   # Main user dashboard
│   ├── merchants/
│   │   ├── register.tsx    # Merchant registration
│   │   └── dashboard.tsx   # Merchant dashboard
│   └── customers/
│       ├── setup.tsx       # Customer setup
│       └── preferences.tsx # Customer preferences
├── components/         # Reusable React components
│   ├── WalletsTab.tsx
│   ├── TransfersTab.tsx
│   ├── CardsTab.tsx
│   └── AgentsTab.tsx
└── lib/
    └── bridge-client.ts    # API client
```

## Features

### Pages

1. **Onboarding** - Multi-step KYC verification
   - Personal information
   - Identity verification
   - Status confirmation

2. **Dashboard** - Unified interface
   - Overview with stats
   - Wallet management
   - Transfer operations
   - Card management
   - AI agent configuration

3. **Merchant Pages**
   - Registration form
   - Merchant dashboard with analytics
   - Payment link generation

### Components

- **WalletsTab** - Create and manage crypto wallets
- **TransfersTab** - Send, on-ramp, off-ramp operations
- **CardsTab** - Issue and manage cards
- **AgentsTab** - Configure AI agents with spending limits

## Setup

```bash
npm install
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Running

```bash
npm run dev
```

Visit `http://localhost:3001`

## Building

```bash
npm run build
npm start
```

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Tailwind CSS styling
- ✅ Type-safe with TypeScript
- ✅ Real-time updates
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Modal dialogs

## API Integration

All API calls use the `BridgeClient` from `lib/bridge-client.ts`:

```typescript
import { bridgeClient } from '../lib/bridge-client';

// Set auth token
bridgeClient.setToken(token);

// Make API calls
const customer = await bridgeClient.createCustomer(...);
const wallets = await bridgeClient.listWallets(customerId);
```

## Styling

Uses Tailwind CSS utility classes for responsive design:

- Mobile-first approach
- Consistent color scheme (blue primary)
- Card-based layouts
- Smooth transitions and hover effects
