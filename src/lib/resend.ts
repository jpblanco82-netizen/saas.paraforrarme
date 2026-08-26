import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
      console.log(`[Resend Mock] Welcome email sent to ${to}`);
      return { success: true };
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@multicontent.ai",
      to: [to],
      subject: "Bienvenido a MultiContent AI - Tu prueba de 7 días ha comenzado",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e293b;">¡Hola, ${name}! 👋</h1>
          <p style="color: #475569; font-size: 16px;">
            Gracias por unirte a <strong>MultiContent AI</strong>. Tienes acceso completo a todas las funcionalidades Pro durante los próximos 7 días.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #334155; font-weight: 500;">
              💡 Empieza pegando cualquier artículo, transcripción de podcast o idea para generar tus primeros posts en segundos.
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/create" 
             style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Crear mi primer contenido
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
            Si tienes alguna duda o sugerencia, simplemente responde a este correo.
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email with Resend:", error);
    return { success: false, error };
  }
}
