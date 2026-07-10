"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production") ||
        "sandbox",
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          const transactionId = event.data?.transaction_id;
          if (transactionId) {
            window.location.href = `/success?_ptxn=${transactionId}`;
          }
        }
      },
    });
  }
  return paddlePromise;
}

export function usePaddleCheckout() {
  const [ready, setReady] = useState(false);
  const paddleRef = useRef<Paddle | undefined>(undefined);

  useEffect(() => {
    getPaddle().then((paddle) => {
      if (paddle) {
        paddleRef.current = paddle;
        setReady(true);
      }
    });
  }, []);

  const openCheckout = useCallback((transactionId: string) => {
    if (!paddleRef.current) return;
    paddleRef.current.Checkout.open({ transactionId });
  }, []);

  return { ready, openCheckout };
}
