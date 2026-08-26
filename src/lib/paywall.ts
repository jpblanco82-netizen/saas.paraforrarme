import { createClient } from "@/lib/supabase/server";

export interface SubscriptionStatus {
  isAllowed: boolean;
  reason?: "active_subscription" | "valid_trial" | "trial_expired" | "no_subscription";
  planId?: string;
  daysRemainingInTrial?: number;
  trialEndsAt?: string;
}

export async function checkPaywallStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !subscription) {
    return {
      isAllowed: false,
      reason: "no_subscription",
    };
  }

  // 1. Verificar si tiene suscripción de pago activa
  if (subscription.status === "active" || subscription.status === "trialing" && subscription.plan_id !== "free_trial") {
    return {
      isAllowed: true,
      reason: "active_subscription",
      planId: subscription.plan_id,
    };
  }

  // 2. Verificar si está en periodo de prueba gratuito de 7 días
  if (subscription.plan_id === "free_trial") {
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();

    if (now <= trialEnd) {
      const diffTime = Math.abs(trialEnd.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        isAllowed: true,
        reason: "valid_trial",
        planId: "free_trial",
        daysRemainingInTrial: diffDays,
        trialEndsAt: subscription.trial_ends_at,
      };
    } else {
      return {
        isAllowed: false,
        reason: "trial_expired",
        planId: "free_trial",
        trialEndsAt: subscription.trial_ends_at,
      };
    }
  }

  return {
    isAllowed: false,
    reason: "no_subscription",
  };
}
