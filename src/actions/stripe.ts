"use server";

import { redirect } from "next/navigation";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createCheckoutSession(planType: "pro" | "agency") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const selectedPlan = planType === "agency" ? PLANS.AGENCY : PLANS.PRO;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Buscar si el usuario ya tiene un Stripe Customer ID en Supabase
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    });
    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: selectedPlan.name,
            description: "Suscripción mensual a MultiContent AI con todas las funcionalidades B2B.",
          },
          unit_amount: selectedPlan.price * 100, // En centavos
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
    metadata: {
      supabase_user_id: user.id,
      plan_id: selectedPlan.id,
    },
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!subscription?.stripe_customer_id) {
    redirect("/dashboard/billing?error=no_stripe_customer");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/dashboard/billing`,
  });

  if (portalSession.url) {
    redirect(portalSession.url);
  }
}
