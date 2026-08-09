'use client';

// Loads Stripe.js from the CDN at runtime (no npm package needed — this app has no
// @stripe/stripe-js dependency installed). Only used when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// is actually set; otherwise the booking flows show a "payment setup pending" note instead.

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

export interface StripeInstance {
  elements: (options: { clientSecret: string }) => StripeElements;
  confirmPayment: (options: {
    elements: StripeElements;
    confirmParams?: Record<string, unknown>;
    redirect?: 'if_required' | 'always';
  }) => Promise<{ error?: { message: string }; paymentIntent?: { status: string } }>;
}

export interface StripeElements {
  create: (type: string, options?: Record<string, unknown>) => StripeElement;
  getElement: (type: string) => StripeElement | null;
}

export interface StripeElement {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
}

let loadPromise: Promise<void> | null = null;

function loadStripeScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Stripe) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function getStripe(publishableKey: string): Promise<StripeInstance | null> {
  try {
    await loadStripeScript();
    if (!window.Stripe) return null;
    return window.Stripe(publishableKey);
  } catch {
    return null;
  }
}

export function stripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
}
