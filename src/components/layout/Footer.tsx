import Link from "next/link";
import React from "react";
import { SOCIAL_LINKS } from "@/config/brand";
import {
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

// Social links come from centralized config

const renderIcon = (name: string) => {
  switch (name) {
    case "Gmail":
      return <FaEnvelope size={22} />;
    case "WhatsApp":
      return <FaWhatsapp size={22} />;
    case "Facebook":
      return <FaFacebook size={22} />;
    case "TikTok":
      return <FaTiktok size={22} />;
    case "Instagram":
      return <FaInstagram size={22} />;
    default:
      return null;
  }
};

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-14">
        {/* Newsletter block */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight uppercase">
            Abonnez-vous à notre newsletter
          </h2>

          <div className="mt-8">
            <NewsletterForm />
          </div>

          {/* Consent text */}
          <p className="mt-6 text-sm text-gray-700 max-w-2xl mx-auto">
            En cliquant sur "Envoyer", vous confirmez que vous avez lu et compris notre
            {" "}
            <Link href="/privacy" className="font-semibold underline underline-offset-2">
              Politique de Confidentialité
            </Link>
            {" "}
            et que vous souhaitez recevoir la newsletter et d'autres communications
            marketing comme indiqué dans celle-ci.
          </p>
        </div>

        {/* Social icons */}
        <div className="mt-10 flex items-center justify-center gap-6 md:gap-8">
          {SOCIAL_LINKS.map((social: { name: string; href: string }) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="text-black hover:opacity-70 transition-opacity"
            >
              {renderIcon(social.name)}
            </a>
          ))}
        </div>

        {/* Simple links */}
        <div className="mt-6 text-center">
          <Link href="/about" className="text-sm font-medium underline underline-offset-2 hover:opacity-80">
            À propos
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-10 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} NUMA. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string>("");

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
      if (res.ok && (data as any).success) {
        setStatus("success");
        setMessage("Merci ! Vous êtes inscrit(e) à la newsletter.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage((data as any).message || "Impossible de vous inscrire pour le moment.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-black pb-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Insérez votre adresse e-mail *"
          className="flex-1 min-w-0 bg-transparent text-black placeholder-gray-600 focus:outline-none py-2"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          disabled={status === "loading"}
          className="p-2 disabled:opacity-60"
        >
          {status === "loading" ? (
            <span className="text-sm">Envoi...</span>
          ) : (
            <FiArrowRight size={22} />
          )}
        </button>
      </form>
      {status !== "idle" && message && (
        <p className={`mt-2 text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
    </div>
  );
}