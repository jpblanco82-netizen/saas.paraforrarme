import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
  
  // Solicitamos permisos para publicar (w_member_social) y leer perfil básico (openid profile)
  const scope = "w_member_social openid profile";
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=linkedin_auth_123&scope=${encodeURIComponent(scope)}`;
  
  return NextResponse.redirect(authUrl);
}
