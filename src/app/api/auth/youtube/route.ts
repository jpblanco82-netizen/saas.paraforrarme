import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;
  
  // Solicitamos permisos para subir videos a YouTube (youtube.upload)
  const scope = "https://www.googleapis.com/auth/youtube.upload";
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=select_account%20consent`;
  
  return NextResponse.redirect(authUrl);
}
