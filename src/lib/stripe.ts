import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
  appInfo: {
    name: "MultiContent AI",
    version: "0.1.0",
  },
});

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
