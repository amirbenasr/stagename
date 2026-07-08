---
name: stripe-local-dev
description: Stripe webhook forwarding for local development + React polling pattern for async result pages (useRef counter, not useState)
source: auto-skill
extracted_at: '2026-07-07T19:53:10.536Z'
---

# Stripe Local Development & Async Result Polling

## Stripe Webhook Forwarding for Localhost

Stripe **cannot** send webhooks to `localhost` directly. During local development, you must use the **Stripe CLI** to forward webhook events to your dev server.

### Setup

1. **Install Stripe CLI**: download from https://stripe.com/docs/stripe-cli or use a package manager (`winget install stripe` on Windows, `brew install stripe` on macOS).

2. **Start forwarding** in a separate terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

3. **Copy the signing secret** (`whsec_...`) from the CLI output and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_from_cli_output_here
   ```

4. **Restart the dev server** after updating the env var.

### Critical: CLI Secret ≠ Dashboard Secret

The `whsec_` from `stripe listen` is **different** from the webhook signing secret shown in the Stripe Dashboard. The dashboard secret only works for webhooks sent to a publicly reachable URL (production). The CLI secret only works for locally forwarded events. Using the wrong one causes signature verification to fail silently — the webhook endpoint returns 401 and the event is dropped.

### Symptoms of Missing/Incorrect Webhook Forwarding

- Payment succeeds on Stripe's side (user gets redirected to success page)
- Success page polls forever showing "Processing..." because the webhook never updated Firestore
- No server-side logs appear when webhook events should have fired
- `stripeSessionId` or `status: "paid"` is never written to the database

### Diagnosis Checklist

1. Is `stripe listen` running in a separate terminal?
2. Does the `whsec_` in `.env.local` match the one from `stripe listen` output (not the dashboard)?
3. Did you restart the dev server after changing the env var?

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
