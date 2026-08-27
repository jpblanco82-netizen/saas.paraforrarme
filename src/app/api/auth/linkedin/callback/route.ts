import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  try {
    // 1. Intercambiar el código por un Access Token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
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
      console.error("LinkedIn Token Error:", tokenData);
      return NextResponse.redirect(`${appUrl}/dashboard?error=linkedin_token_failed`);
    }

    const accessToken = tokenData.access_token;

    // 2. Obtener el perfil del usuario para sacar su URN (ID único de persona)
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    
    if (!profileData.sub) {
       console.error("LinkedIn Profile Error:", profileData);
       return NextResponse.redirect(`${appUrl}/dashboard?error=linkedin_profile_failed`);
    }
    
    const personUrn = `urn:li:person:${profileData.sub}`;

    // 3. Guardar en los metadatos del usuario en Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.auth.updateUser({
        data: {
          linkedin_access_token: accessToken,
          linkedin_person_urn: personUrn
        }
      });
    }

    // Redirigir de vuelta al dashboard con éxito
    return NextResponse.redirect(`${appUrl}/dashboard?linkedin=connected`);
  } catch (err) {
    console.error("LinkedIn Auth Exception:", err);
    return NextResponse.redirect(`${appUrl}/dashboard?error=linkedin_exception`);
  }
}
