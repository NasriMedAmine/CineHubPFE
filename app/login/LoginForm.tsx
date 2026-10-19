"use client";

// Formulaire de connexion

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }

      // Connexion réussie : on va sur la page demandée et on rafraîchit le menu
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {errorMessage && <p className="message-error">{errorMessage}</p>}

      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>

      <button type="submit" className="button" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="muted">
        Pas encore de compte ? <Link href="/register">S&apos;inscrire</Link>
      </p>
    </form>
  );
}
