"use client";

// Barre de navigation. Le menu change selon que l'utilisateur est connecté ou non.
// Sur mobile, le menu s'ouvre avec le bouton ☰.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import InstallButton from "./InstallButton";

type NavbarProps = {
  userName: string | null;
};

export default function Navbar({ userName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ajoute la classe "active" au lien de la page courante
  function linkClass(href: string) {
    return pathname === href ? "active" : "";
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });

    // On vide le cache des pages : elles pouvaient contenir le nom de l'utilisateur
    if ("caches" in window) {
      await caches.delete("cinehub-pages");
    }

    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <Link href="/" className="logo">
          Cine<span>Hub</span>
        </Link>

        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">
          ☰
        </button>

        {/* Un clic sur un lien referme le menu mobile */}
        <div className={menuOpen ? "nav-links open" : "nav-links"} onClick={() => setMenuOpen(false)}>
          <Link href="/movies" className={linkClass("/movies")}>Films</Link>
          <Link href="/search" className={linkClass("/search")}>Recherche</Link>

          {userName ? (
            <>
              <Link href="/favorites" className={linkClass("/favorites")}>Favoris</Link>
              <Link href="/library" className={linkClass("/library")}>Ma bibliothèque</Link>
              <Link href="/assistant" className={linkClass("/assistant")}>Assistant IA</Link>
              <Link href="/profile" className={linkClass("/profile")}>👤 {userName}</Link>
              <button className="button button-secondary button-small" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>Connexion</Link>
              <Link href="/register" className="button button-small">Inscription</Link>
            </>
          )}

          <InstallButton />
        </div>
      </nav>
    </header>
  );
}
