import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Costo de Vida Ecuador | Comparador",
  description: "Compara el costo de vida mensual entre ciudades de Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
