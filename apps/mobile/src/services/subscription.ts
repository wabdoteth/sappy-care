export type SubscriptionStatus = {
  isActive: boolean;
};

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return { isActive: false };
}
