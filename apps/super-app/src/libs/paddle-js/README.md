# Paddle.js Integration

This module provides a thin wrapper around the official [`@paddle/paddle-js`](https://www.npmjs.com/package/@paddle/paddle-js) package with custom configuration helpers and React hooks for the Web Super App.

## Overview

This wrapper is designed to be **easy to maintain** by:

- ✅ Using official types and functions from `@paddle/paddle-js`
- ✅ Only adding custom utilities that provide app-specific value
- ✅ Avoiding duplication of Paddle's core functionality
- ✅ Re-exporting everything from the official package for convenience

## Installation

The official Paddle.js package is already installed:

```bash
pnpm add @paddle/paddle-js
```

## Quick Start

### Basic Usage with React Hook

```tsx
import { buildInitializeConfig, usePaddle } from "@/libs/paddle-js";

function MyComponent() {
  const { paddle, ready, open } = usePaddle(buildInitializeConfig());

  const handleCheckout = () => {
    if (!ready) return;

    open({
      items: [{ priceId: "pri_xxx", quantity: 1 }],
    });
  };

  return <button onClick={handleCheckout}>Subscribe</button>;
}
```

### Using Configuration Helpers

```tsx
import {
  buildInitializeConfig,
  createSingleItemCheckout,
  withCustomerEmail,
  withDiscount,
} from "@/libs/paddle-js";

// Build initialization config from environment variables
const config = buildInitializeConfig({
  pwCustomer: { id: "ctm_xxx" },
  environment: "sandbox", // or 'production'
});

// Create checkout config with helpers
let checkoutConfig = createSingleItemCheckout("pri_xxx", 1);
checkoutConfig = withCustomerEmail(checkoutConfig, "user@example.com");
checkoutConfig = withDiscount(checkoutConfig, "SUMMER2024");
```

### Inline Checkout

```tsx
import {
  buildInitializeConfig,
  usePaddle,
  withInlineSettings,
} from "@/libs/paddle-js";

function InlineCheckout() {
  const { open } = usePaddle(buildInitializeConfig());

  const handleOpenInline = () => {
    const config = withInlineSettings(
      { items: [{ priceId: "pri_xxx", quantity: 1 }] },
      "paddle-checkout-container", // CSS class name
      { theme: "dark", initialHeight: 500 }
    );
    open(config);
  };

  return (
    <>
      <button onClick={handleOpenInline}>Open Checkout</button>
      {/* IMPORTANT: Use className, not id */}
      <div className="paddle-checkout-container" />
    </>
  );
}
```

## API Reference

### React Hook

#### `usePaddle(config)`

React hook for Paddle.js integration.

**Parameters:**

- `config: InitializePaddleOptions | null` - Paddle initialization config

**Returns:**

```typescript
{
  paddle: Paddle | null;           // Paddle instance
  ready: boolean;                   // Is Paddle initialized?
  error: Error | null;              // Initialization error
  open: (config) => void;           // Open checkout
  update: (config) => void;         // Update checkout
  updateItems: (items) => void;     // Update checkout items
  close: () => void;                // Close checkout
  showSpinner: () => void;          // Show loading spinner
  hideSpinner: () => void;          // Hide loading spinner
  subscribe: (event, handler) => void; // Event subscription (deprecated)
}
```

### Configuration Helpers

#### `buildInitializeConfig(options?)`

Build Paddle initialization config from environment variables.

**Environment Variables:**

- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` - Your Paddle client token (required)
- `NEXT_PUBLIC_ENV_NAME` - Environment name (optional, defaults to sandbox)

**Parameters:**

```typescript
{
  pwCustomer?: PaddleSetupPwCustomer | null;
  environment?: 'sandbox' | 'production';
}
```

#### `getClientToken()`

Get Paddle client token from environment.

#### `getEnvironment(token?)`

Determine environment from token prefix (`test_` or `live_`) or env variables.

### Utility Functions

#### `createSingleItemCheckout(priceId, quantity?, customer?)`

Create a simple checkout config with a single item.

#### `createMultiItemCheckout(items, customer?)`

Create a checkout config with multiple items.

#### `withDiscount(config, discountCode)`

Add discount code to checkout config.

#### `withDiscountId(config, discountId)`

Add discount ID to checkout config.

#### `withCustomData(config, customData)`

Add custom data to checkout config.

#### `withCustomerEmail(config, email)`

Add customer email to checkout config.

#### `withInlineSettings(config, frameTarget, options?)`

Configure inline checkout settings.

**Important:** Paddle.js uses `getElementsByClassName` internally, so `frameTarget` must be a CSS class name (not an ID).

#### `validatePaddleId`

Validate Paddle ID formats:

```typescript
validatePaddleId.price("pri_xxx"); // true
validatePaddleId.customer("ctm_xxx"); // true
validatePaddleId.transaction("txn_xxx"); // true
validatePaddleId.subscription("sub_xxx"); // true
validatePaddleId.discount("dsc_xxx"); // true
```

### Constants

```typescript
import {
  PADDLE_DISPLAY_MODE,
  PADDLE_ENVIRONMENT,
  PADDLE_EVENTS,
  PADDLE_THEME,
} from "@/libs/paddle-js";

// Event names
PADDLE_EVENTS.CHECKOUT_LOADED;
PADDLE_EVENTS.CHECKOUT_COMPLETED;
// ... more events

// Environments
PADDLE_ENVIRONMENT.SANDBOX;
PADDLE_ENVIRONMENT.PRODUCTION;

// Display modes
PADDLE_DISPLAY_MODE.OVERLAY;
PADDLE_DISPLAY_MODE.INLINE;

// Themes
PADDLE_THEME.LIGHT;
PADDLE_THEME.DARK;
```

## Using Official Types

All types from `@paddle/paddle-js` are re-exported for convenience:

```typescript
import type {
  CheckoutCustomer,
  CheckoutOpenOptions,
  CheckoutSettings,
  Paddle,
  PaddleEventData,
  // ... and many more
} from "@/libs/paddle-js";
```

## Advanced Usage

### Direct Paddle Instance

If you need to access the Paddle instance directly:

```tsx
const { paddle, ready } = usePaddle(buildInitializeConfig());

if (ready && paddle) {
  // Use any Paddle method
  paddle.PricePreview({ items: [{ priceId: "pri_xxx", quantity: 1 }] });
  paddle.Spinner.show();
  paddle.Checkout.close();
}
```

### Event Handling

Use `eventCallback` in the initialization config:

```tsx
const config = buildInitializeConfig();
config.eventCallback = (event) => {
  console.log("Paddle event:", event.name, event.data);
};

const { open } = usePaddle(config);
```

### Manual Initialization

If you need more control:

```tsx
import { initializePaddle } from "@/libs/paddle-js";

const paddle = await initializePaddle({
  token: "your-token",
  environment: "sandbox",
  eventCallback: (event) => {
    console.log(event);
  },
});

paddle.Checkout.open({ items: [{ priceId: "pri_xxx" }] });
```

## Maintenance Notes

This wrapper is designed for **easy maintenance**:

1. **Official Package First**: All core functionality comes from `@paddle/paddle-js`
2. **Minimal Custom Code**: Only configuration helpers and React hook
3. **No Type Duplication**: Uses official TypeScript types
4. **Easy Updates**: Update `@paddle/paddle-js` version to get latest features

When Paddle releases new features:

- Simply update the npm package: `pnpm update @paddle/paddle-js`
- Types and functionality are automatically available
- No need to update custom wrapper code

## Resources

- [Official Paddle.js Documentation](https://developer.paddle.com/paddlejs/overview)
- [Paddle.js Events](https://developer.paddle.com/paddlejs/events)
- [Paddle API Reference](https://developer.paddle.com/api-reference)
- [@paddle/paddle-js on npm](https://www.npmjs.com/package/@paddle/paddle-js)
