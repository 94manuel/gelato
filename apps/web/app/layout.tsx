import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ñam Gelato Lab",
  description: "Balanceador profesional de recetas de gelato"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
