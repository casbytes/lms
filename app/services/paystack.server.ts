import crypto from "node:crypto";
import { Paystack as _Paystack } from "paystack-sdk";
import type {
  CreateCustomer,
  UpdateCustomer,
  FetchCustomerResponse,
} from "paystack-sdk/dist/customer/interface";
import type {
  InitializeTransaction,
  TransactionInitialized,
} from "paystack-sdk/dist/transaction/interface";
import type { PlanResponse, Plan } from "paystack-sdk/dist/plan";
import {
  FetchSubscription,
  GenerateSubscriptionLink,
  Subscription,
} from "paystack-sdk/dist/subscription";

const { PAYSTACK_SECRET_KEY, BASE_URL } = process.env;
const paystack = new _Paystack(PAYSTACK_SECRET_KEY);

/**
 * List all active plans on paystack
 * @returns {Promise<Plan[]>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listPlans(): Promise<Record<string, any>> {
  try {
    const plans = await paystack.plan.list({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount: "" as any,
      status: "active",
    });
    if (!plans.status) {
      throw new Error("Failed to retrieve Paystack plans.");
    }
    return (plans as PlanResponse).data;
  } catch (error) {
    throw new Error("Error fetching plans from Paystack.");
  }
}

/**
 * Create a new customer on paystack
 * @param {CreateCustomer} data - Customer data
 * @returns {Promise<FetchCustomerResponse>}
 */
export async function createCustomer({
  email,
  first_name,
  last_name,
}: CreateCustomer) {
  try {
    return await paystack.customer.create({ email, first_name, last_name });
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing customer on paystack
 * @param {string} code - Customer code
 * @param {UpdateCustomer} data - Customer data
 * @returns {Promise<FetchCustomerResponse>}
 */
export async function updateCustomer(
  code: string,
  { email, first_name, last_name }: UpdateCustomer
) {
  try {
    return await paystack.customer.update(code, {
      email,
      first_name,
      last_name,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve a customer on paystack
 * @param code - Customer code
 * @returns {Promise<FetchCustomerResponse>}
 */
export async function retrieveCustomer(code: string) {
  try {
    return await paystack.customer.fetch(code);
  } catch (error) {
    throw error;
  }
}

/**
 * Initialize a transaction on paystack
 * @param {string} email - Customer email
 * @param {string} plan - Plan code
 * @returns {Promise<FetchCustomerResponse>}
 */
export async function initializeTransaction({
  email,
  plan,
}: {
  email: string;
  plan: string;
}) {
  try {
    return await paystack.transaction.initialize({
      email,
      plan,
      amount: "",
      channels: ["card"],
      callback_url: `${BASE_URL}/subscription?success=true`,
    } as InitializeTransaction);
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve the active subscription of a user
 * @param {string} customerCode - Customer code
 * @returns {Promise<FetchSubscription | null>}
 */
async function retrieveUserActiveSubscription(customerCode: string) {
  try {
    const customer = await retrieveCustomer(customerCode);
    if (!customer.status) {
      throw new Error(`Failed to retrieve customer: ${customer.message}`);
    }
    if (
      !customer.data?.subscriptions ||
      customer.data.subscriptions.length === 0
    ) {
      return undefined;
    }

    const activeSub = customer.data.subscriptions.find(
      (sub) => sub.status === "active"
    );
    if (!activeSub) {
      return undefined;
    }
    return (await paystack.subscription.fetch(
      activeSub.subscription_code
    )) as FetchSubscription | null;
  } catch (error) {
    throw error;
  }
}

/**
 * Update a subscription
 * @param {string} subscriptionCode - Subscription code
 * @returns {Promise<GenerateSubscriptionLink>}
 */
async function updateSubscription(subscriptionCode: string) {
  try {
    return await paystack.subscription.generateSubscriptionLink(
      subscriptionCode
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Construct a webhook event
 * @param {Request} request - Request object
 * @returns {Promise<any>}
 */
async function constructWebhookEvent(request: Request) {
  const payload = await request.text();
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  if (hash != request.headers.get("x-paystack-signature")) {
    throw new Response("Invalid signature", { status: 400 });
  }
  return JSON.parse(payload);
}

export class Paystack {
  static listPlans = listPlans;
  static createCustomer = createCustomer;
  static updateCustomer = updateCustomer;
  static retrieveCustomer = retrieveCustomer;
  static initializeTransaction = initializeTransaction;
  static retrieveActiveSubscription = retrieveUserActiveSubscription;
  static updateSubscription = updateSubscription;
  static constructWebhookEvent = constructWebhookEvent;
}

export type {
  Plan,
  Subscription,
  PlanResponse,
  FetchSubscription,
  FetchCustomerResponse,
  TransactionInitialized,
  GenerateSubscriptionLink,
};
