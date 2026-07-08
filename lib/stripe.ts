import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set — Stripe operations will fail at runtime");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY ?? "", {
  apiVersion: STRIPE_API_VERSION,
});

export const STRIPE_PRICING = {
  currency: "usd" as const,
  productName: "stagename.club — Artist Debut Kit",
  unitAmount: 1499,
} as const;

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
