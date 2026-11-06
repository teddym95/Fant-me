import Link from "next/link";

const benefices = [
  {
    titre: "Tout voir en 2 minutes",
    texte:
      "Tu déposes ton relevé : on repère les prélèvements qui reviennent, mois après mois.",
  },
  {
    titre: "Classés par coût annuel",
    texte:
      "Un abonnement à 6 € paraît anodin. À 72 € par an, la question se pose.",
  },
  {
    titre: "Une lettre de résiliation prête",
    texte:
      "Pour chaque fantôme, un courrier rédigé. Tu n'as plus qu'à l'envoyer.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-12">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#b8452e]">
        Fantômes
      </p>
      <h1 className="font-serif text-4xl font-bold leading-tight">
        Débusque les abonnements que tu paies sans t&apos;en servir.
      </h1>
      <p className="mt-6 text-lg leading-relaxed">
        Un essai jamais résilié, un service remplacé, une option activée une
        fois. Ces petits prélèvements tournent des années sans que tu les
        voies.
      </p>

      <div className="mt-8 rounded-2xl border border-[#1c1917]/15 p-5">
        <p className="text-sm uppercase tracking-wide text-[#1c1917]/60">
          Un exemple
        </p>
        <p className="mt-2 font-serif text-2xl leading-snug">
          5 abonnements oubliés à 8 €/mois,
          <br />
          <span className="text-[#b8452e]">c&apos;est 480 € par an.</span>
        </p>
      </div>

      <Link
        href="/commencer"
        className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-[#1c1917] px-6 text-lg font-semibold text-[#faf6ee]"
      >
        Commencer, c&apos;est gratuit
      </Link>
      <p className="mt-3 text-center text-sm text-[#1c1917]/60">
        3 questions, 1 minute, aucun paiement.
      </p>

      <ul className="mt-12 space-y-8">
        {benefices.map((b) => (
          <li key={b.titre}>
            <h2 className="font-serif text-xl font-bold">{b.titre}</h2>
            <p className="mt-1 leading-relaxed text-[#1c1917]/80">{b.texte}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
