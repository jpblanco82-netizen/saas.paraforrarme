import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const cookiesToApply: Array<{ name: string; value: string; options?: any }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => cookiesToApply.push(cookie));
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error.message);
      return NextResponse.json(
        {
          error:
            error.message === "Invalid login credentials"
              ? "Credenciales incorrectas. Verifica correo y contraseña."
              : error.message,
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Aplicar todas las cookies generadas por Supabase al response
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        ...options,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    });

    return response;
  } catch (err: any) {
    console.error("Login API crash:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
