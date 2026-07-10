---
name: stripe-local-dev
description: Payment provider local dev (Stripe CLI / Paddle webhook testing) + provider abstraction pattern + React polling with useRef
source: auto-skill
extracted_at: '2026-07-07T19:53:10.536Z'
---

# Payment Provider Local Dev & Async Result Polling

## Provider Abstraction Layer

Payments use a **provider-agnostic abstraction** in `lib/payments/`:
- `types.ts` — `PaymentProvider` interface (`createCheckoutSession`, `handleWebhook`, `lookupSession`)
- `index.ts` — `getPaymentProvider()` factory, reads `PAYMENT_PROVIDER` env var (default: `"paddle"`)
- `paddle.ts` — Paddle Billing implementation (active)
- `stripe.ts` — Stripe implementation (preserved for easy swap-back)

**Swap providers** by changing `PAYMENT_PROVIDER` env var + uncommenting/commenting relevant keys in `.env.local`. No code changes needed.

**Firestore field**: `paymentSessionId` (provider-agnostic, replaces old `stripeSessionId`).

## Stripe Local Development

Stripe **cannot** send webhooks to `localhost` directly. Use the **Stripe CLI** to forward events.

### Setup

1. **Install Stripe CLI**: `winget install stripe` (Windows) or `brew install stripe` (macOS).
2. **Start forwarding**: `stripe listen --forward-to localhost:3000/api/webhook`
3. **Copy the `whsec_...` secret** from CLI output → set as `STRIPE_WEBHOOK_SECRET` in `.env.local`
4. **Restart dev server** after updating env var.

### Critical: CLI Secret ≠ Dashboard Secret

The `whsec_` from `stripe listen` is **different** from the Stripe Dashboard webhook secret. Dashboard secret only works for production URLs. CLI secret only works for local forwarding. Wrong secret = silent 401 failures.

## Paddle Local Development

Paddle sandbox webhooks also can't reach `localhost`. Two options:

1. **Use ngrok** to expose localhost: `ngrok http 3000` → set the ngrok URL as notification destination in Paddle Dashboard
2. **Use Paddle's webhook simulator** in the Dashboard to send test events to a production URL

### Paddle Webhook Signature Verification

Paddle sends `Paddle-Signature` header: `ts={timestamp};h1={signature}` (HMAC-SHA256). The `handleWebhook` method in `paddle.ts` verifies this automatically. Requires `PADDLE_WEBHOOK_SECRET` env var (generated when creating notification destination in Dashboard).

### Paddle Checkout Prerequisites

- **Default Payment Link** must be set in Paddle Dashboard → Checkout → Settings (required before transactions can be created)
- **Notification destination** must be created for `transaction.completed` events

## Diagnosis Checklist (Any Provider)

- Payment succeeds but success page polls forever → webhook not reaching server
- Check: Is the webhook forwarding tool running? (stripe listen / ngrok)
- Check: Does the webhook secret in `.env.local` match the forwarding tool's secret?
- Check: Did you restart the dev server after changing env vars?
- Check: Is `paymentSessionId` being written to Firestore? (was `stripeSessionId` before migration)

## React Polling Pattern: useRef Counter (Not useState)

When a page polls an API for an async result (e.g. waiting for a brand kit to finish generating after payment), the polling counter **must not** be in React state if it's also in the `useEffect` dependency array.

### The Bug

```tsx
// ❌ pollCount in state + in useEffect deps = interval resets every tick
const [pollCount, setPollCount] = useState(0);

useEffect(() => {
  const interval = setInterval(async () => {
    if (pollCount > 20) { /* give up */ return; }
    // ... poll ...
    setPollCount(c => c + 1); // triggers re-render → useEffect re-runs → new interval
  }, 3000);
  return () => clearInterval(interval);
}, [sessionId, pollCount]); // pollCount here causes infinite polling
```

The `pollCount > 20` limit is **never reached** because every `setPollCount` call triggers a re-render, which re-runs the effect, which creates a new interval with `pollCount` reset to 0 relative to the new closure.

### The Fix: useRef for the Counter

```tsx
// ✅ useRef persists across renders without triggering them
const pollRef = useRef(0);

useEffect(() => {
  const poll = async () => {
    const res = await fetch(`/api/lookup?session_id=${sessionId}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.slug) {
      setResult(data);
      return true;
    }
    return false;
  };

  poll(); // immediate first attempt

  const interval = setInterval(async () => {
    pollRef.current += 1;
    if (pollRef.current > 20) {
      setError("Taking longer than expected. We'll email you.");
      clearInterval(interval);
      return;
    }
    const found = await poll();
    if (found) clearInterval(interval);
  }, 3000);

  return () => clearInterval(interval);
}, [sessionId]); // only depends on sessionId — interval is stable
```

Key differences:
- `useRef` counter doesn't trigger re-renders
- `useEffect` dependency array only includes the session ID
- The interval is created once and persists until cleanup
- The 20-attempt limit actually works
