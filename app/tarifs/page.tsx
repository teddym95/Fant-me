"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const cle = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = cle ? loadStripe(cle) : null;

const CONTACT = "[ton-email]";

const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const faq = [
  {
    q: "Est-ce que ça marche pour mon cas ?",
    r: "Fantômes lit l'export CSV de ta banque et repère les prélèvements qui reviennent chaque mois, pour un montant stable. Il ne trouve pas tout : un abonnement dont le prix change souvent, ou un relevé de moins de 3 mois, peut passer à côté. Si ton fichier n'est pas lisible, écris-nous : tu es remboursé.",
  },
  {
    q: "Combien de temps ça me prend ?",
    r: "Environ 2 minutes pour voir tes fantômes. Ensuite, chaque lettre est prête : il reste à compléter ton nom et ton adresse, puis à l'envoyer.",
  },
  {
    q: "Et si je veux arrêter ?",
    r: "Il n'y a rien à arrêter : c'est un paiement unique, aucun abonnement, rien ne se renouvelle. Et pendant 14 jours, tu peux te faire rembourser sur simple email.",
  },
  {
    q: "À quoi sert exactement ce que je paie ?",
    r: "À débloquer les lettres de résiliation de tous tes fantômes (la première est déjà gratuite) et le suivi de ce que tu économises. Ton relevé n'est ni envoyé ni stocké : il reste sur ton téléphone.",
  },
];

export default function Tarifs() {
  const [clientSecret, setClientSecret] = useState("");
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<{ total: number; nb: number } | null>(
    null
  );

  useEffect(() => {
    try {
      const brut = sessionStorage.getItem("fantomes-resultat");
      if (brut) {
        const r = JSON.parse(brut);
        if (typeof r.total === "number" && typeof r.nb === "number") {
          setResultat({ total: r.total, nb: r.nb });
        }
      }
    } catch {
      /* pas de résultat enregistré */
    }

    fetch("/api/checkout", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
        else setErreur(d.erreur ?? "Le paiement est indisponible.");
      })
      .catch(() =>
        setErreur("Impossible de joindre le paiement. Vérifie ta connexion.")
      );
  }, []);

  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8">
      <Link href="/depot" className="text-sm text-[#1c1917]/60 underline">
        ← Retour à mes fantômes
      </Link>

      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-[#b8452e]">
        Ton audit
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">
        Voilà ton audit, prêt.
      </h1>
      <p className="mt-3 text-lg leading-relaxed">
        {resultat ? (
          <>
            Ton relevé a révélé {resultat.nb}{" "}
            {resultat.nb > 1 ? "fantômes possibles" : "fantôme possible"} :{" "}
            <span className="font-semibold text-[#b8452e]">
              {eur0.format(resultat.total)} par an
            </span>
            . Pour 19 €, une seule fois, tu gardes toutes les lettres pour les
            résilier.
          </>
        ) : (
          <>
            Un seul abonnement oublié à 8 € par mois, c&apos;est{" "}
            <span className="font-semibold text-[#b8452e]">96 € par an</span>.
            Ici : 19 €, une seule fois.
          </>
        )}
      </p>

      <div className="mt-6 rounded-2xl border-2 border-[#1c1917] p-5">
        <p className="font-serif text-xl font-bold">Audit complet</p>
        <p className="mt-1">
          <span className="font-serif text-4xl font-bold">19 €</span>{" "}
          <span className="text-[#1c1917]/70">une seule fois</span>
        </p>
        <p className="mt-1 text-sm text-[#1c1917]/60">
          Environ 5 centimes par jour sur une année.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-[#1c1917]/5 p-5">
        <p className="font-semibold">Satisfait ou remboursé, 14 jours.</p>
        <p className="mt-1 text-sm leading-relaxed text-[#1c1917]/80">
          Écris à {CONTACT} dans les 14 jours suivant ton paiement : tu es
          remboursé en intégralité, sous 5 jours ouvrés, sans justification.
        </p>
      </div>

      <p className="mt-6 text-center font-medium">
        Paiement unique : aucun abonnement, rien ne se renouvelle.
      </p>

      <div className="mt-4">
        {erreur ? (
          <p className="rounded-2xl border border-[#b8452e]/40 p-4 text-[#b8452e]">
            {erreur} Réessaie dans un instant, ou écris à {CONTACT}.
          </p>
        ) : clientSecret && stripePromise ? (
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        ) : (
          <p className="py-8 text-center text-[#1c1917]/60">
            Chargement du paiement sécurisé…
          </p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-[#1c1917]/50">
        Paiement sécurisé par Stripe. Nous ne voyons jamais ton numéro de carte.
      </p>

      <h2 className="mt-12 font-serif text-2xl font-bold">
        Questions fréquentes
      </h2>
      <div className="mt-4 space-y-3">
        {faq.map((f) => (
          <details
            key={f.q}
            className="rounded-2xl border border-[#1c1917]/15 p-5"
          >
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-3 leading-relaxed text-[#1c1917]/80">{f.r}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
