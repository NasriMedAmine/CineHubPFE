"use client";

// Page d'inscription (F01)

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Petite vérification côté navigateur (le serveur vérifie aussi tout)
    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
      } else {
        setSuccessMessage("Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
    setLoading(false);
  }

  return (
    <div className="form-card">
      <h1>Inscription</h1>

      {successMessage ? (
        <div className="form">
          <p className="message-success">{successMessage}</p>
          <Link href="/login" className="button">
            Se connecter
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          {errorMessage && <p className="message-error">{errorMessage}</p>}

          <label>
            Nom
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Mot de passe (8 caractères minimum)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="muted">
            Déjà inscrit ? <Link href="/login">Se connecter</Link>
          </p>
        </form>
      )}
    </div>
  );
}
