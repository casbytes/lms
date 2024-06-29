export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MENTOR = "MENTOR",
  TRAINER = "TRAINER",
  MODERATOR = "MODERATOR",
}

export enum CourseProgressStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum Status {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TestStatus {
  LOCKED = "LOCKED",
  AVAILABLE = "AVAILABLE",
  COMPLETED = "COMPLETED",
}

export enum CheckpointStatus {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  COMPLETED = "COMPLETED",
}

export enum BadgeLevel {
  NOVICE = "NOVICE",
  ADEPT = "ADEPT",
  PROFICIENT = "PROFICIENT",
  VIRTUOSO = "VIRTUOSO",
}

export enum BadgeStatus {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
}

export enum StripeEventTypes {
  CUSTOMER_SUBSCRIPTION_CREATED = "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_DELETED = "customer.subscription.deleted",
  CUSTOMER_SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  INVOICE_PAYMENT_SUCCEEDED = "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED = "invoice.payment_failed",
  CUSTOMER_CREATED = "customer.created",
  CUSTOMER_DELETED = "customer.deleted",
  CUSTOMER_UPDATED = "customer.updated",
}
