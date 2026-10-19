import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import OfflineIndicator from "@/components/OfflineIndicator";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CineHub",
  description: "Découvrez des films, publiez vos avis et gérez votre bibliothèque personnelle.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "CineHub",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f14",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // L'utilisateur connecté est lu côté serveur pour afficher le bon menu
  const user = await getCurrentUser();

  return (
    <html lang="fr">
      <body>
        <Navbar userName={user ? user.name : null} />
        <OfflineIndicator />
        <main className="container">{children}</main>
        <footer className="footer">
          <p>CineHub — Projet universitaire · Next.js, TypeScript, SQLite</p>
        </footer>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
