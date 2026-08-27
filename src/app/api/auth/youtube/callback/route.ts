import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=no_code`);
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${appUrl}/api/auth/youtube/callback`;

  try {
    // 1. Intercambiar el código por Tokens
    console.log("Intercambiando código de YouTube OAuth...");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error("YouTube Token Error:", tokenData);
      return NextResponse.redirect(`${appUrl}/dashboard?error=youtube_token_failed`);
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Calcular fecha de expiración
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + (expires_in || 3600));

    // 2. Guardar en los metadatos del usuario en Supabase (Sesión y Admin DB)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updates: any = {
        youtube_access_token: access_token,
        youtube_token_expiry: expiryDate.toISOString(),
      };
      
      if (refresh_token) {
         updates.youtube_refresh_token = refresh_token;
      }

      // Actualizar sesión del cliente
      await supabase.auth.updateUser({
        data: updates
      });

      // Actualizar directamente en base de datos con Admin
      try {
        const adminClient = await createAdminClient();
        await adminClient.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            ...updates
          }
        });
        console.log("Tokens de YouTube guardados con éxito en Supabase.");
      } catch (adminErr) {
        console.warn("Fallo admin update, usando update básico:", adminErr);
      }
    }

    // Redirigir de vuelta al dashboard con éxito
    return NextResponse.redirect(`${appUrl}/dashboard?youtube=connected`);
  } catch (err) {
    console.error("YouTube Auth Exception:", err);
    return NextResponse.redirect(`${appUrl}/dashboard?error=youtube_exception`);
  }
}
