// Cliente de Stripe optimizado y autónomo
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = {
  customers: {
    create: async (params: { email?: string; metadata?: Record<string, string> }) => {
      try {
        if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_placeholder")) {
          return { id: `cus_mock_${Date.now()}` };
        }
        const body = new URLSearchParams();
        if (params.email) body.append("email", params.email);
        if (params.metadata) {
          Object.entries(params.metadata).forEach(([k, v]) => body.append(`metadata[${k}]`, v));
        }
        const res = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
        return await res.json();
      } catch (err) {
        console.error("Stripe customer create error:", err);
        return { id: `cus_fallback_${Date.now()}` };
      }
    },
  },
  checkout: {
    sessions: {
      create: async (params: any) => {
        try {
          if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_placeholder")) {
            return { url: `${params.success_url?.replace("{CHECKOUT_SESSION_ID}", "cs_mock_123")}` };
          }
          const body = new URLSearchParams();
          body.append("customer", params.customer);
          body.append("mode", params.mode || "subscription");
          body.append("success_url", params.success_url);
          body.append("cancel_url", params.cancel_url);
          if (params.metadata) {
            Object.entries(params.metadata).forEach(([k, v]: any) => body.append(`metadata[${k}]`, v));
          }
          if (params.line_items?.[0]?.price_data) {
            const item = params.line_items[0].price_data;
            body.append("line_items[0][price_data][currency]", item.currency);
            body.append("line_items[0][price_data][unit_amount]", item.unit_amount.toString());
            body.append("line_items[0][price_data][product_data][name]", item.product_data.name);
            body.append("line_items[0][price_data][recurring][interval]", item.recurring.interval);
            body.append("line_items[0][quantity]", "1");
          }
          const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });
          return await res.json();
        } catch (err) {
          console.error("Stripe checkout create error:", err);
          return { url: params.success_url?.replace("{CHECKOUT_SESSION_ID}", "cs_mock_123") };
        }
      },
    },
  },
  billingPortal: {
    sessions: {
      create: async (params: { customer: string; return_url: string }) => {
        try {
          if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_placeholder")) {
            return { url: params.return_url };
          }
          const body = new URLSearchParams();
          body.append("customer", params.customer);
          body.append("return_url", params.return_url);
          const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });
          return await res.json();
        } catch (err) {
          console.error("Stripe billing portal create error:", err);
          return { url: params.return_url };
        }
      },
    },
  },
};

export const PLANS = {
  PRO: {
    id: "pro",
    name: "Plan Profesional",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro_29_monthly",
    features: [
      "Generación ilimitada de posts para LinkedIn y X",
      "Formatos de Newsletters y Hilos optimizados",
      "Modelos de IA de alta precisión (Gemini 1.5 Pro / GPT-4o)",
      "Panel de ROI y horas ahorradas",
      "Soporte prioritario",
    ],
  },
  AGENCY: {
    id: "agency",
    name: "Plan Agencia / Multi-Marca",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID || "price_agency_79_monthly",
    features: [
      "Todo lo del Plan Pro",
      "Múltiples perfiles y tonos de marca personalizados",
      "Integración directa con redes y Webhooks",
      "Colas asíncronas de ultra-alta velocidad",
      "Gestor de cuenta dedicado y API Access",
    ],
  },
};
