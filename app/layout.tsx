import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OFF-SKY — Viste fuera de lo común",
  description: "Streetwear colombiano. Drops limitados, básicos esenciales y actitud OFF-SKY.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
