"use client";

import { useEffect, useMemo, useState } from "react";

import { getCloudFlareCountry } from "@/app/actions/credentials";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import type { CheckoutCustomer } from "@/libs/paddle-js";
import { useGlobalState } from "@/store/global/hooks";

/* -------------------------------------------------------------------------- */
/*  Country lookup (Cloudflare geo) — resolved once per session, cached here.  */
/* -------------------------------------------------------------------------- */

// Bound the lookup so a stalled request can never block an auto-opening checkout
// (e.g. mobile express) indefinitely. On timeout we settle to `null` (fail soft).
const GEO_LOOKUP_TIMEOUT_MS = 3000;

// `undefined` = not resolved yet; `null` = resolved but unavailable.
let cachedCountry: string | null | undefined;
let inFlight: Promise<string | null> | null = null;

function resolveCheckoutCountry(): Promise<string | null> {
  if (cachedCountry !== undefined) {
    return Promise.resolve(cachedCountry);
  }
  if (inFlight) {
    return inFlight;
  }

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), GEO_LOOKUP_TIMEOUT_MS);
  });

  inFlight = (async () => {
    try {
      const country = await Promise.race([getCloudFlareCountry(), timeout]);
      cachedCountry = country;
      return country;
    } catch {
      cachedCountry = null;
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/* -------------------------------------------------------------------------- */

export interface CheckoutCustomerState {
  customer: CheckoutCustomer;
  /**
   * Whether the country lookup has settled. Flips to `true` together with the country
   * in a single state update, so when it is `true` the returned `customer` already
   * carries the country (or it is legitimately unavailable). Auto-opening flows
   * (mobile express) MUST wait for this before opening, so they never start in
   * `draft` by racing the lookup.
   */
  isCountryResolved: boolean;
}

/**
 * Builds the Paddle checkout `customer` shared by every checkout surface
 * (desktop, mobile express, and any future UI):
 *
 * - identity: the Paddle customer id when Paddle Retain is available, else the email;
 * - address: the visitor's country (from Cloudflare geo) so the transaction starts in
 *   `ready` — full payment UI (wallet buttons + card form + method tabs) — instead of
 *   `draft`, where Paddle must collect the address first.
 *
 * Pass `customer` straight into `openForProduct({ customer })`. The country is omitted
 * until the lookup resolves (or when unavailable), in which case Paddle collects the
 * address itself — the pre-existing behavior.
 */
export function useCheckoutCustomer(): CheckoutCustomerState {
  const paddleCustomerId = useGlobalState((state) => state.paddleCustomerId);
  const userEmail = useGlobalState((state) => state.user.email);

  const { getValueSyncRemoteConfig, isReady: isFirebaseRemoteConfigReady } =
    useRemoteConfigContext();
  const isPaddleRetainAvailable =
    isFirebaseRemoteConfigReady &&
    getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.ENABLE_PADDLE_RETAIN);

  // `code` and `resolved` move together so `isCountryResolved` truthiness implies the
  // country is final (including the legitimate `null` outcome).
  const [country, setCountry] = useState<{
    code: string | null;
    resolved: boolean;
  }>(() =>
    cachedCountry === undefined
      ? { code: null, resolved: false }
      : { code: cachedCountry, resolved: true }
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const code = await resolveCheckoutCountry();
      if (active) {
        setCountry({ code, resolved: true });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const customer = useMemo<CheckoutCustomer>(() => {
    const identity =
      paddleCustomerId && isPaddleRetainAvailable
        ? { id: paddleCustomerId }
        : { email: userEmail };

    return {
      ...identity,
      ...(country.code ? { address: { countryCode: country.code } } : {}),
    } as CheckoutCustomer;
  }, [paddleCustomerId, isPaddleRetainAvailable, userEmail, country.code]);

  return { customer, isCountryResolved: country.resolved };
}
