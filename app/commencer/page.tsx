"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    titre: "À peu près combien d'abonnements as-tu ?",
    aide: "Streaming, musique, sport, applis, box, assurances…",
    choix: [
      { label: "1 à 3", valeur: 2 },
      { label: "4 à 6", valeur: 5 },
      { label: "7 ou plus", valeur: 8 },
    ],
  },
  {
    titre: "Ça te coûte combien par mois, en tout ?",
    aide: "Une estimation suffit.",
    choix: [
      { label: "Moins de 30 €", valeur: 20 },
      { label: "30 à 70 €", valeur: 50 },
      { label: "Plus de 70 €", valeur: 90 },
    ],
  },
  {
    titre: "Quand as-tu vérifié ta liste pour la dernière fois ?",
    aide: "Sois honnête, personne ne regarde.",
    choix: [
      { label: "Ce mois-ci", valeur: 1 },
      { label: "Il y a plus d'un an", valeur: 2 },
      { label: "Jamais vraiment", valeur: 3 },
    ],
  },
];

export default function Commencer() {
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<number[]>([]);

  const termine = etape >= questions.length;
  const pourcentage = Math.round((etape / questions.length) * 100);

  function choisir(index: number) {
    setReponses([...reponses.slice(0, etape), index]);
    setEtape(etape + 1);
  }

  function retour() {
    if (etape > 0) setEtape(etape - 1);
  }

  if (termine) {
    const nb = questions[0].choix[reponses[0]].valeur;
    const mensuel = questions[1].choix[reponses[1]].valeur;
    const annuel = mensuel * 12;
    const unOublie = Math.round((mensuel / nb) * 12);

    return (
      <main className="mx-auto max-w-md px-6 pb-16 pt-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#b8452e]">
          Ton résultat
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight">
          Tu paies environ {annuel} € par an en abonnements.
        </h1>
        <p className="mt-5 text-lg leading-relaxed">
          Tu as dit : {questions[0].choix[reponses[0]].label.toLowerCase()}{" "}
          abonnements, {questions[1].choix[reponses[1]].label.toLowerCase()} par
          mois, dernière vérification :{" "}
          {questions[2].choix[reponses[2]].label.toLowerCase()}.
        </p>

        <div className="mt-8 rounded-2xl border border-[#1c1917]/15 p-5">
          <p className="text-sm uppercase tracking-wide text-[#1c1917]/60">
            Pour un seul abonnement oublié
          </p>
          <p className="mt-2 font-serif text-2xl leading-snug text-[#b8452e]">
            environ {unOublie} € par an, partis en silence.
          </p>
          <p className="mt-2 text-sm text-[#1c1917]/60">
            Estimation d&apos;après tes réponses : le prix moyen d&apos;un de
            tes abonnements, sur 12 mois.
          </p>
        </div>

        <p className="mt-8 text-lg leading-relaxed">
          Fantômes repère lesquels tournent pour rien, les classe par coût
          annuel et te donne la lettre pour les résilier.
        </p>

        <Link
          href="/depot"
          className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-[#1c1917] px-6 text-lg font-semibold text-[#faf6ee]"
        >
          Voir mes fantômes, gratuit
        </Link>
        <p className="mt-3 text-center text-sm text-[#1c1917]/60">
          Ton relevé reste sur ton téléphone. Rien n&apos;est stocké.
        </p>
      </main>
    );
  }

  const q = questions[etape];

  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8">
      <div className="mb-8">
        <div className="h-2 w-full rounded-full bg-[#1c1917]/10">
          <div
            className="h-2 rounded-full bg-[#b8452e] transition-all"
            style={{ width: `${pourcentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[#1c1917]/60">
          Question {etape + 1} sur {questions.length}
        </p>
      </div>

      <h1 className="font-serif text-3xl font-bold leading-tight">
        {q.titre}
      </h1>
      <p className="mt-3 text-[#1c1917]/70">{q.aide}</p>

      <div className="mt-8 space-y-3">
        {q.choix.map((c, i) => (
          <button
            key={c.label}
            onClick={() => choisir(i)}
            className="flex min-h-14 w-full items-center rounded-2xl border border-[#1c1917]/20 px-5 text-left text-lg font-medium active:bg-[#1c1917]/5"
          >
            {c.label}
          </button>
        ))}
      </div>

      {etape > 0 && (
        <button
          onClick={retour}
          className="mt-8 min-h-12 text-[#1c1917]/60 underline"
        >
          Retour
        </button>
      )}
    </main>
  );
}
