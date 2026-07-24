# Paddle.js Usage Examples

## Basic Examples

### 1. Simple Checkout Button

```tsx
"use client";

import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function BuyButton({ priceId }: { priceId: string }) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  return (
    <button
      disabled={!ready}
      onClick={() => open({ items: [{ priceId, quantity: 1 }] })}
    >
      {ready ? "Buy Now" : "Loading..."}
    </button>
  );
}
```

### 2. Checkout with Customer Email

```tsx
"use client";

import {
  buildInitializeConfig,
  createSingleItemCheckout,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function CheckoutWithEmail({
  priceId,
  email,
}: {
  priceId: string;
  email: string;
}) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleCheckout = () => {
    open(createSingleItemCheckout(priceId, 1, { email }));
  };

  return (
    <button disabled={!ready} onClick={handleCheckout}>
      Subscribe
    </button>
  );
}
```

### 3. Multi-Item Checkout

```tsx
"use client";

import {
  buildInitializeConfig,
  createMultiItemCheckout,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function CartCheckout({
  items,
}: {
  items: Array<{ priceId: string; quantity: number }>;
}) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleCheckout = () => {
    open(createMultiItemCheckout(items));
  };

  return (
    <button disabled={!ready || items.length === 0} onClick={handleCheckout}>
      Checkout ({items.length} items)
    </button>
  );
}
```

## Inline Checkout Examples

### 4. Basic Inline Checkout

```tsx
"use client";

import {
  buildInitializeConfig,
  PADDLE_DISPLAY_MODE,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function InlineCheckout({ priceId }: { priceId: string }) {
  const config = buildInitializeConfig({
    checkout: {
      displayMode: PADDLE_DISPLAY_MODE.INLINE,
      theme: "light",
    },
  });

  const { ready, open } = usePaddle(config);

  const handleOpen = () => {
    open({
      items: [{ priceId }],
      settings: {
        // IMPORTANT: Paddle.js uses getElementsByClassName, so use className not id!
        frameTarget: "paddle-checkout-container",
        frameInitialHeight: 450,
        frameStyle:
          "width: 100%; min-width: 312px; background-color: transparent; border: none;",
      },
    });
  };

  return (
    <div>
      <button disabled={!ready} onClick={handleOpen}>
        Open Checkout
      </button>
      {/* Use className="paddle-checkout-container", NOT id */}
      <div className="paddle-checkout-container mt-4" />
    </div>
  );
}
```

### 5. Inline Checkout with Helper (Class Name)

```tsx
"use client";

import {
  buildInitializeConfig,
  usePaddle,
  withInlineSettings,
} from "vul-super-app/libs/paddle-js";

export function InlineCheckoutHelper({ priceId }: { priceId: string }) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleOpen = () => {
    const config = withInlineSettings(
      { items: [{ priceId }] },
      "paddle-checkout-container", // This is treated as a CLASS NAME
      { theme: "dark", initialHeight: 500 }
    );
    open(config);
  };

  return (
    <div>
      <button disabled={!ready} onClick={handleOpen}>
        Open Checkout
      </button>
      {/* Use className, not id */}
      <div className="paddle-checkout-container" />
    </div>
  );
}
```

### 5b. Inline Checkout with HTMLElement (Using ID)

```tsx
"use client";

import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function InlineCheckoutWithId({ priceId }: { priceId: string }) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleOpen = () => {
    // Get the element by ID and pass it directly
    const container = document.getElementById("my-checkout-container");
    if (!container) {
      console.error("Checkout container not found");
      return;
    }

    open({
      items: [{ priceId }],
      settings: {
        displayMode: "inline",
        frameTarget: container, // Pass HTMLElement directly
        frameInitialHeight: 500,
        theme: "dark",
      },
    });
  };

  return (
    <div>
      <button disabled={!ready} onClick={handleOpen}>
        Open Checkout
      </button>
      {/* Now you can use id instead of className */}
      <div id="my-checkout-container" />
    </div>
  );
}
```

## Event Handling Examples

### 6. Listen to Checkout Completed

```tsx
"use client";

import { useEffect } from "react";
import {
  buildInitializeConfig,
  PADDLE_EVENTS,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function CheckoutWithTracking({ priceId }: { priceId: string }) {
  const { ready, open, subscribe } = usePaddle(buildInitializeConfig());

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      unsubscribe = await subscribe(
        PADDLE_EVENTS.CHECKOUT_COMPLETED,
        (event) => {
          console.log("Checkout completed:", event.data);
          // Track conversion, redirect user, etc.
        }
      );
    })();

    return () => {
      unsubscribe?.();
    };
  }, [subscribe]);

  return (
    <button disabled={!ready} onClick={() => open({ items: [{ priceId }] })}>
      Buy
    </button>
  );
}
```

### 7. Multiple Event Listeners

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  buildInitializeConfig,
  PADDLE_EVENTS,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function CheckoutWithMultipleEvents({ priceId }: { priceId: string }) {
  const { ready, open, subscribe } = usePaddle(buildInitializeConfig());
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    (async () => {
      const events = [
        { name: PADDLE_EVENTS.CHECKOUT_LOADED, label: "Checkout opened" },
        {
          name: PADDLE_EVENTS.CHECKOUT_PAYMENT_INITIATED,
          label: "Payment initiated",
        },
        { name: PADDLE_EVENTS.CHECKOUT_COMPLETED, label: "Purchase complete!" },
        { name: PADDLE_EVENTS.CHECKOUT_CLOSED, label: "Checkout closed" },
      ];

      for (const event of events) {
        const unsub = await subscribe(event.name, () => {
          setStatus(event.label);
        });
        unsubscribers.push(unsub);
      }
    })();

    return () => {
      for (const unsub of unsubscribers) {
        unsub();
      }
    };
  }, [subscribe]);

  return (
    <div>
      <button disabled={!ready} onClick={() => open({ items: [{ priceId }] })}>
        Buy
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}
```

## Advanced Examples

### 8. Checkout with Discount Code

```tsx
"use client";

import {
  buildInitializeConfig,
  usePaddle,
  withDiscount,
} from "vul-super-app/libs/paddle-js";

export function CheckoutWithDiscount({
  priceId,
  discountCode,
}: {
  priceId: string;
  discountCode?: string;
}) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleCheckout = () => {
    let config = { items: [{ priceId }] };
    if (discountCode) {
      config = withDiscount(config, discountCode);
    }
    open(config);
  };

  return (
    <button disabled={!ready} onClick={handleCheckout}>
      Buy Now
    </button>
  );
}
```

### 9. Checkout with Custom Data

```tsx
"use client";

import {
  buildInitializeConfig,
  usePaddle,
  withCustomData,
} from "vul-super-app/libs/paddle-js";

export function CheckoutWithMetadata({
  priceId,
  userId,
  source,
}: {
  priceId: string;
  userId: string;
  source: string;
}) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleCheckout = () => {
    const config = withCustomData(
      { items: [{ priceId }] },
      { user_id: userId, utm_source: source }
    );
    open(config);
  };

  return (
    <button disabled={!ready} onClick={handleCheckout}>
      Subscribe
    </button>
  );
}
```

### 10. Paddle Retain for Logged-in Users

```tsx
"use client";

import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function LoggedInCheckout({
  priceId,
  customerId,
}: {
  priceId: string;
  customerId: string;
}) {
  // Initialize with customer ID for Retain features
  const config = buildInitializeConfig({
    pwCustomer: { id: customerId },
  });

  const { ready, open } = usePaddle(config);

  return (
    <button disabled={!ready} onClick={() => open({ items: [{ priceId }] })}>
      Upgrade
    </button>
  );
}
```

### 11. Price Preview

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  buildInitializeConfig,
  pricePreview,
  usePaddle,
} from "vul-super-app/libs/paddle-js";

export function PricePreview({ priceId }: { priceId: string }) {
  const [preview, setPreview] = useState<any>(null);
  const { ready } = usePaddle(buildInitializeConfig());

  useEffect(() => {
    if (!ready) return;

    pricePreview({
      items: [{ priceId, quantity: 1 }],
    })
      .then(setPreview)
      .catch(console.error);
  }, [priceId, ready]);

  if (!preview) return <div>Loading price...</div>;

  return (
    <div>
      <p>
        Price: {preview.data?.details?.lineItems?.[0]?.formattedTotals?.total}
      </p>
    </div>
  );
}
```

### 12. Resume Transaction

```tsx
"use client";

import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function ResumeCheckout({ transactionId }: { transactionId: string }) {
  const { ready, open } = usePaddle(buildInitializeConfig());

  const handleResume = () => {
    open({ transactionId });
  };

  return (
    <button disabled={!ready} onClick={handleResume}>
      Resume Checkout
    </button>
  );
}
```

## Testing Examples

### 13. Environment-Specific Config

```tsx
"use client";

import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function TestCheckout({ priceId }: { priceId: string }) {
  // Explicitly set environment (auto-detected from token by default)
  const config = buildInitializeConfig({
    environment: "sandbox", // or "production"
  });

  const { ready, error, open } = usePaddle(config);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <button disabled={!ready} onClick={() => open({ items: [{ priceId }] })}>
      Test Buy
    </button>
  );
}
```

### 14. Update Checkout Items

```tsx
"use client";

import { useState } from "react";
import { buildInitializeConfig, usePaddle } from "vul-super-app/libs/paddle-js";

export function DynamicCheckout({ priceIds }: { priceIds: string[] }) {
  const { ready, open, update } = usePaddle(buildInitializeConfig());
  const [selectedPriceId, setSelectedPriceId] = useState(priceIds[0]);

  const handleOpen = () => {
    open({ items: [{ priceId: selectedPriceId }] });
  };

  const handleUpdate = (newPriceId: string) => {
    setSelectedPriceId(newPriceId);
    update({ items: [{ priceId: newPriceId }] });
  };

  return (
    <div>
      <select
        onChange={(e) => handleUpdate(e.target.value)}
        value={selectedPriceId}
      >
        {priceIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <button disabled={!ready} onClick={handleOpen}>
        Checkout
      </button>
    </div>
  );
}
```

## Best Practices

1. **Always check `ready` state** before opening checkout
2. **Clean up event subscriptions** in useEffect cleanup
3. **Handle errors** using the `error` state from usePaddle
4. **Use constants** for event names to avoid typos
5. **Validate Paddle IDs** before passing to API
6. **Use helper functions** for common patterns
7. **Pass customer info** when available for better UX
8. **Test with sandbox** tokens before going live
