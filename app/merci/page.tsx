"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Etat = "verification" | "paye" | "echec";

export default function Merci() {
  const [etat, setEtat] = useState<Etat>("verification");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (!id) {
      setEtat("echec");
      return;
    }
    fetch(`/api/verifier?session_id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.paye) {
          try {
            localStorage.setItem("fantomes-debloque", id);
          } catch {
            /* stockage indisponible */
          }
          setEtat("paye");
        } else {
          setEtat("echec");
        }
      })
      .catch(() => setEtat("echec"));
  }, []);

  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-12">
      {etat === "verification" && (
        <p className="text-[#1c1917]/60">Vérification de ton paiement…</p>
      )}

      {etat === "paye" && (
        <>
          <p className="text-sm font-medium uppercase tracking-widest text-[#b8452e]">
            Paiement reçu
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight">
            Merci ! Toutes tes lettres sont débloquées.
          </h1>
          <p className="mt-4 text-lg text-[#1c1917]/70">
            Dépose à nouveau ton relevé : chaque fantôme a maintenant sa lettre
            de résiliation prête à copier. Ton reçu Stripe arrive par email.
          </p>
          <Link
            href="/depot"
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-[#1c1917] px-6 text-lg font-semibold text-[#faf6ee]"
          >
            Voir toutes mes lettres
          </Link>
          <p className="mt-4 text-sm text-[#1c1917]/50">
            Le déblocage est enregistré sur cet appareil. Garde cette page en
            favori pour le retrouver sur un autre.
          </p>
        </>
      )}

      {etat === "echec" && (
        <>
          <h1 className="font-serif text-3xl font-bold leading-tight">
            Nous n&apos;avons pas pu confirmer ton paiement.
          </h1>
          <p className="mt-4 text-[#1c1917]/70">
            Si tu as été débité, recharge cette page dans un instant. Sinon,
            tu peux réessayer depuis la page des tarifs.
          </p>
          <Link
            href="/tarifs"
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-[#1c1917] px-6 text-lg font-semibold text-[#faf6ee]"
          >
            Retour aux tarifs
          </Link>
        </>
      )}
    </main>
  );
}
