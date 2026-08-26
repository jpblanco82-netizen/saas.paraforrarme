import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultiContent AI - Micro-SaaS B2B",
  description: "Transforma contenido largo en piezas de alto impacto para LinkedIn, X y Newsletters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-50">{children}</body>
    </html>
  );
}
