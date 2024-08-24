import Stripe from "stripe";
import { remember } from "@epic-web/remember";
import { cache } from "~/utils/node-cache.server";

export const stripe = remember(
  "stripe",
  () =>
    new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
);

interface CreateStripeCustomer {
  email: string;
  name: string;
}

/**
 * Create a Stripe customer
 * @param {CreateStripeCustomer} - Create a Stripe customer
 * @returns  {Promise<Stripe.Customer>} - Stripe customer
 */
export async function createStripeCustomer({
  email,
  name,
}: CreateStripeCustomer) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function updateStripeCustomer({
  stripeCustomerId,
  data,
}: {
  stripeCustomerId: string;
  data: Record<string, string>;
}) {
  return stripe.customers.update(stripeCustomerId, data);
}

/**
 * Delete a Stripe customer
 * @param {string} stripeCustomerId - Stripe customer ID
 * @returns  {Promise<Stripe.DeletedCustomer>} - Stripe deleted customer
 */
export async function deleteStripeCustomer({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}) {
  return stripe.customers.del(stripeCustomerId);
}

/**
 * Create a Stripe subscription
 * @returns {Promise<Stripe.Price[]>} - Stripe prices
 */
export async function listPlans() {
  const cacheKey = "stripe-prices";
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as Stripe.Price[];
  }
  const prices = await stripe.prices.list({
    active: true,
    limit: 4,
  });
  cache.set<Stripe.Price[]>(cacheKey, prices.data);
  return prices.data;
}

/**
 * Create a Stripe checkout session
 * @param {string} customerId - Stripe customer ID
 * @param {string} priceId - Stripe price ID
 * @param {string} successUrl - Success URL
 * @param {string} cancelUrl - Cancel URL
 * @returns  {Promise<Stripe.Checkout.Session>} - Stripe checkout session
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: Record<string, string>) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create a Stripe billing portal session
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - Return URL
 * @returns {Promise<Stripe.BillingPortal.Session>} - Stripe billing portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: Record<string, string>) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Retrieve a Stripe customer subscription
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Stripe.Subscription>} - Stripe subscription
 */
export async function listSubscriptions({
  customerId,
}: {
  customerId?: string;
}) {
  const cacheKey = `stripe-subscriptions-${customerId}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as Stripe.Subscription[];
  }
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "active",
  });
  cache.set<Stripe.Subscription[]>(cacheKey, subs.data);
  return subs.data;
}

/**
 * Construct a Stripe webhook event
 * @param {Request} request - Request object
 * @returns  {Promise<Stripe.Event>} - Stripe event
 */
export async function constructWebhookEvent(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  return stripe.webhooks.constructEvent(
    payload,
    signature!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export { Stripe };
