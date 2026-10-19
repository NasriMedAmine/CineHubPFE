"use client";

// Formulaire de modification du profil

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileFormProps = {
  initialName: string;
  initialEmail: string;
};

export default function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
      } else {
        setSuccessMessage("Profil mis à jour.");
        router.refresh(); // met à jour le nom affiché dans le menu
      }
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
    setLoading(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {errorMessage && <p className="message-error">{errorMessage}</p>}
      {successMessage && <p className="message-success">{successMessage}</p>}

      <label>
        Nom
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <button type="submit" className="button" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
