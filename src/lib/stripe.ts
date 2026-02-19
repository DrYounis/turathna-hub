import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const PRODUCTS = [
    {
        id: 'prod_turathna_premium',
        name: 'Premium Artisan Membership',
        price: 49.99,
        features: ['Unlimited listings', 'Priority support', 'Analytics dashboard']
    }
];
