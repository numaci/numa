"use client";

import React from "react";

export default function NewsletterModal() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem("newsletter_prompt_seen");
      const subscribed = localStorage.getItem("newsletter_subscribed");
      if (seen === "true" || subscribed === "true") return;
      const t = setTimeout(() => setOpen(true), 6000);
      return () => clearTimeout(t);
    } catch {}
  }, []);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem("newsletter_prompt_seen", "true"); } catch {}
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.already ? "Vous êtes déjà inscrit(e)." : "Merci ! Vous êtes inscrit(e) à la newsletter.");
        try { localStorage.setItem("newsletter_subscribed", "true"); } catch {}
        setTimeout(() => setOpen(false), 1500);
      } else {
        setStatus("error");
        setMessage(data.message || "Impossible de vous inscrire pour le moment.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Erreur réseau. Veuillez réessayer.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white text-black p-6 shadow-2xl">
        <button onClick={close} className="absolute top-3 right-3 text-gray-500 hover:text-black" aria-label="Fermer">✕</button>
        <h3 className="text-xl font-bold">Rejoignez la newsletter</h3>
        <p className="text-sm text-gray-700 mt-2">Recevez nos nouveautés et offres exclusives par email.</p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-black text-white font-semibold px-4 py-3 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Envoi..." : "S'inscrire"}
          </button>
          {status !== "idle" && message && (
            <p className={`text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <button type="button" onClick={close} className="text-sm text-gray-600 underline mt-1">Plus tard</button>
        </form>
      </div>
    </div>
  );
}
