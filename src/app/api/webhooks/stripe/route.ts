import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body;
    const supabaseAdmin = await createAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data?.object;
        const userId = session?.metadata?.supabase_user_id;
        const planId = session?.metadata?.plan_id || "pro";

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              plan_id: planId,
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data?.object;
        const customerId = subscription?.customer;

        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data?.object;
        const customerId = subscription?.customer;

        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "canceled",
              plan_id: "free_trial",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        console.log(`Received Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
