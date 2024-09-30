import Stripe from "stripe";
import invariant from "tiny-invariant";

const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BASE_URL } = process.env;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

/**
 * Create a new customer in Stripe.
 * @param email - The email address of the customer.
 * @param name - The name of the customer.
 * @returns {Promise<Stripe.Response<Stripe.Customer>>} The customer object.
 */
async function createCustomer({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  try {
    return await stripe.customers.create({ email, name });
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing customer in Stripe.
 * @param customerId - The customer ID.
 * @param email - The email address of the customer.
 * @param name - The name of the customer.
 * @returns {Promise<Stripe.Response<Stripe.Customer>>} The customer object.
 */
async function updateCustomer({
  customerId,
  email,
  name,
}: {
  customerId: string;
  email: string;
  name: string;
}) {
  try {
    return await stripe.customers.update(customerId, { email, name });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a customer in Stripe.
 * @param customerId - The customer ID.
 * @returns {Promise<Stripe.Response<Stripe.DeletedCustomer>>} The deleted customer object.
 */
async function deleteCustomer(customerId: string) {
  try {
    return await stripe.customers.del(customerId);
  } catch (error) {
    throw error;
  }
}

/**
 * List active plans in Stripe.
 * @returns {Promise<Stripe.Response<Stripe.ApiList<Stripe.Plan>>>} The list of active plans.
 */
async function listPlans() {
  try {
    return await stripe.plans.list({ active: true, limit: 4 });
  } catch (error) {
    throw error;
  }
}

/**
 * Get an active subscription in Stripe.
 * @param subscriptionId - The subscription ID.
 * @returns {Promise<Stripe.Response<Stripe.Subscription>>} The subscription object.
 */
async function getActiveSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new checkout session in Stripe.
 * @param customerId - The customer ID.
 * @param priceId - The price ID.
 * @returns {Promise<Stripe.Response<Stripe.Checkout.Session>>} The checkout session object.
 */
async function createCheckoutSession({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) {
  try {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${BASE_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/subscription?canceled=true`,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new billing portal session for a customer in Stripe.
 * @param customerId - The customer ID.
 * @returns {Promise<Stripe.Response<Stripe.BillingPortal.Session>>} The billing portal session object.
 */
async function createBillingPortalSession(customerId: string) {
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE_URL}/subscription`,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Construct a webhook event from a request.
 * @param request - The request object.
 * @returns {Promise<Stripe.Event>} The webhook event object.
 */
async function constructWebhookEvent(request: Request) {
  const signature = request.headers.get("stripe-signature") as string;
  invariant(signature, "Stripe signature is required.");
  try {
    const payload = await request.text();
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Stripe service
 * @class
 * @static
 * @property {Function} listPlans - List active plans in Stripe
 * @property {Function} createCustomer - Create a new customer in Stripe
 * @property {Function} updateCustomer - Update an existing customer in Stripe
 * @property {Function} deleteCustomer - Delete a customer in Stripe
 * @property {Function} getActiveSubscription - Get an active subscription in Stripe
 * @property {Function} createCheckoutSession - Create a new checkout session in Stripe
 * @property {Function} constructWebhookEvent - Construct a webhook event from a request
 * @property {Function} createBillingPortalSession - Create a new billing portal session for a customer in Stripe
 */
export class STRIPE {
  static listPlans = listPlans;
  static createCustomer = createCustomer;
  static updateCustomer = updateCustomer;
  static deleteCustomer = deleteCustomer;
  static getActiveSubscription = getActiveSubscription;
  static createCheckoutSession = createCheckoutSession;
  static constructWebhookEvent = constructWebhookEvent;
  static createBillingPortalSession = createBillingPortalSession;
}
export { Stripe };
