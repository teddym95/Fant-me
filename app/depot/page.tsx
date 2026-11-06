"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";

type Operation = { date: Date; montant: number; libelle: string };
type Fantome = {
  nom: string;
  libelle: string;
  mensuel: number;
  annuel: number;
  occurrences: number;
};

const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eur2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const MOTS_BRUITS = new Set([
  "prlv", "prelevement", "sepa", "carte", "cb", "paiement", "par", "vir",
  "virement", "de", "du", "la", "le", "les", "des", "facture", "fact", "ref",
  "mandat", "echeance", "abonnement", "commande", "achat", "retrait", "dab",
  "tpe", "pos", "sas", "sarl", "sa", "eur", "com", "fr", "ab", "bv", "ltd",
  "inc", "llc", "gmbh",
]);

function exemple(): string {
  const lignes = ["Date;Libellé;Montant"];
  const abos: [string, string, number][] = [
    ["05", "PRLV SEPA NETFLIX.COM", 13.49],
    ["12", "PRLV SEPA BASIC FIT FRANCE", 24.99],
    ["18", "PAIEMENT CB SPOTIFY AB", 10.99],
    ["21", "PRLV SEPA CLOUDSTOCK PLUS", 2.99],
  ];
  [6, 7, 8, 9, 10].forEach((m, i) => {
    const mm = String(m).padStart(2, "0");
    abos.forEach(([jour, nom, prix]) => {
      lignes.push(
        `${jour}/${mm}/2026;${nom};-${prix.toFixed(2).replace(".", ",")}`
      );
    });
    lignes.push(`02/${mm}/2026;VIR SALAIRE;1850,00`);
    lignes.push(
      `${String(8 + i).padStart(2, "0")}/${mm}/2026;CARTE CARREFOUR MARKET;-${(
        41.2 +
        i * 9.1
      )
        .toFixed(2)
        .replace(".", ",")}`
    );
  });
  return lignes.join("\n");
}

function lireTexte(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

function decouperLigne(ligne: string, sep: string): string[] {
  const cellules: string[] = [];
  let courant = "";
  let guillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') {
      if (guillemets && ligne[i + 1] === '"') {
        courant += '"';
        i++;
      } else {
        guillemets = !guillemets;
      }
    } else if (c === sep && !guillemets) {
      cellules.push(courant.trim());
      courant = "";
    } else {
      courant += c;
    }
  }
  cellules.push(courant.trim());
  return cellules;
}

function lireMontant(brut: string | undefined): number | null {
  if (!brut) return null;
  let t = brut.replace(/[\s\u00a0€]/g, "").replace(/\u2212/g, "-");
  if (!t) return null;
  if (t.includes(",") && t.includes(".")) {
    const virguleEnDernier = t.lastIndexOf(",") > t.lastIndexOf(".");
    t = virguleEnDernier
      ? t.replace(/\./g, "").replace(",", ".")
      : t.replace(/,/g, "");
  } else {
    t = t.replace(",", ".");
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function lireDate(brut: string | undefined): Date | null {
  if (!brut) return null;
  const t = brut.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) {
    const annee = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(annee, Number(m[2]) - 1, Number(m[1]));
  }
  return null;
}

function lireReleve(texte: string): Operation[] {
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lignes.length < 2) return [];

  const echantillon = lignes.slice(0, 15).join("\n");
  const sep = [";", "\t", ","]
    .map((s) => ({ s, n: echantillon.split(s).length - 1 }))
    .sort((a, b) => b.n - a.n)[0].s;

  const tableau = lignes.map((l) => decouperLigne(l, sep));
  const idxEntete = tableau
    .slice(0, 20)
    .findIndex(
      (cells) =>
        cells.some((c) => /date/i.test(c)) &&
        cells.some((c) =>
          /libell|label|description|intitul|d[ée]tail|montant|d[ée]bit|amount|objet|motif/i.test(
            c
          )
        )
    );
  if (idxEntete === -1) return [];

  const entete = tableau[idxEntete];
  let colDate = entete.findIndex(
    (c) => /date/i.test(c) && /op[ée]ration/i.test(c)
  );
  if (colDate === -1) colDate = entete.findIndex((c) => /date/i.test(c));
  const colLibelle = entete.findIndex((c) =>
    /libell|label|description|intitul|d[ée]tail|objet|motif/i.test(c)
  );
  const colMontant = entete.findIndex((c) => /montant|amount/i.test(c));
  const colDebit = entete.findIndex((c) => /d[ée]bit/i.test(c));
  const colCredit = entete.findIndex((c) => /cr[ée]dit/i.test(c));

  const ops: Operation[] = [];
  for (const cells of tableau.slice(idxEntete + 1)) {
    const date = lireDate(cells[colDate]);
    if (!date) continue;

    let montant: number | null = null;
    if (colMontant !== -1) {
      montant = lireMontant(cells[colMontant]);
    } else {
      const debit = colDebit !== -1 ? lireMontant(cells[colDebit]) : null;
      const credit = colCredit !== -1 ? lireMontant(cells[colCredit]) : null;
      if (debit) montant = -Math.abs(debit);
      else if (credit) montant = Math.abs(credit);
    }
    if (montant === null || montant === 0) continue;

    const libelle =
      colLibelle !== -1
        ? cells[colLibelle] ?? ""
        : cells
            .filter((_, i) => i !== colDate && i !== colMontant)
            .join(" ");
    ops.push({ date, montant, libelle });
  }
  return ops;
}

function cle(libelle: string): string {
  const mots = libelle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((m) => m.length > 1 && !MOTS_BRUITS.has(m));
  return mots.slice(0, 2).join(" ");
}

function majuscules(texte: string): string {
  return texte
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mediane(valeurs: number[]): number {
  const t = [...valeurs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
}

function detecter(ops: Operation[]): Fantome[] {
  const depenses = ops.filter((o) => o.montant < 0);
  if (depenses.length === 0) return [];

  const temps = ops.map((o) => o.date.getTime());
  const moisCouverts =
    (Math.max(...temps) - Math.min(...temps)) / (30.44 * 86400000);
  const minimum = moisCouverts >= 2.5 ? 3 : 2;

  const groupes = new Map<string, Operation[]>();
  for (const o of depenses) {
    const k = cle(o.libelle);
    if (!k) continue;
    groupes.set(k, [...(groupes.get(k) ?? []), o]);
  }

  const resultats: Fantome[] = [];
  groupes.forEach((liste, k) => {
    const moisDistincts = new Set(
      liste.map((o) => `${o.date.getFullYear()}-${o.date.getMonth()}`)
    );
    if (moisDistincts.size < minimum) return;

    const montants = liste.map((o) => Math.abs(o.montant));
    const med = mediane(montants);
    const proches = montants.filter(
      (m) => Math.abs(m - med) <= Math.max(med * 0.15, 1.5)
    );
    if (proches.length / montants.length < 0.7) return;

    const dates = liste.map((o) => o.date.getTime()).sort((a, b) => a - b);
    const ecarts = dates
      .slice(1)
      .map((d, i) => (d - dates[i]) / 86400000)
      .filter((e) => e > 5);
    if (ecarts.length === 0) return;
    const ecartMedian = mediane(ecarts);
    if (ecartMedian < 24 || ecartMedian > 38) return;

    resultats.push({
      nom: majuscules(k),
      libelle: liste[0].libelle.replace(/\s+/g, " ").trim().slice(0, 40),
      mensuel: med,
      annuel: med * 12,
      occurrences: moisDistincts.size,
    });
  });

  return resultats.sort((a, b) => b.annuel - a.annuel);
}

export default function Depot() {
  const [fantomes, setFantomes] = useState<Fantome[] | null>(null);
  const [erreur, setErreur] = useState("");

  function analyser(texte: string) {
    const ops = lireReleve(texte);
    if (ops.length === 0) {
      setFantomes(null);
      setErreur(
        "Je n'ai pas réussi à lire ce fichier. Vérifie que c'est bien un export CSV de ta banque, avec des colonnes date, libellé et montant."
      );
      return;
    }
    setErreur("");
    setFantomes(detecter(ops));
  }

  async function surFichier(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    if (fichier.size > 5_000_000) {
      setErreur("Ce fichier est trop gros. Essaie avec les 12 derniers mois.");
      return;
    }
    analyser(lireTexte(await fichier.arrayBuffer()));
  }

  function recommencer() {
    setFantomes(null);
    setErreur("");
  }

  const total = (fantomes ?? []).reduce((s, f) => s + f.annuel, 0);

  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8">
      <Link href="/" className="text-sm text-[#1c1917]/60 underline">
        ← Accueil
      </Link>

      {fantomes === null ? (
        <>
          <h1 className="mt-6 font-serif text-3xl font-bold leading-tight">
            Dépose ton relevé, on cherche les fantômes.
          </h1>
          <p className="mt-4 text-lg leading-relaxed">
            Ton fichier reste sur ton téléphone : il est lu ici, jamais envoyé,
            jamais stocké.
          </p>

          <label className="mt-8 flex min-h-14 w-full cursor-pointer items-center justify-center rounded-full bg-[#1c1917] px-6 text-lg font-semibold text-[#faf6ee]">
            Choisir mon relevé (CSV)
            <input
              type="file"
              accept=".csv,.txt,text/csv"
              onChange={surFichier}
              className="hidden"
            />
          </label>

          <button
            onClick={() => analyser(exemple())}
            className="mt-3 flex min-h-14 w-full items-center justify-center rounded-full border border-[#1c1917]/25 px-6 text-lg font-medium"
          >
            Essayer avec un exemple
          </button>

          {erreur && (
            <p className="mt-6 rounded-2xl border border-[#b8452e]/40 p-4 text-[#b8452e]">
              {erreur}
            </p>
          )}

          <details className="mt-10 rounded-2xl border border-[#1c1917]/15 p-5">
            <summary className="cursor-pointer font-medium">
              Comment obtenir ce fichier ?
            </summary>
            <p className="mt-3 leading-relaxed text-[#1c1917]/80">
              Sur le site de ta banque (souvent plus complet que l&apos;appli) :
              ouvre ton compte courant, cherche « Exporter » ou « Télécharger »,
              choisis le format CSV et prends 3 à 12 mois.
            </p>
          </details>
        </>
      ) : (
        <>
          <p className="mt-6 text-sm font-medium uppercase tracking-widest text-[#b8452e]">
            Tes fantômes
          </p>
          {fantomes.length === 0 ? (
            <>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
                Aucun prélèvement récurrent repéré.
              </h1>
              <p className="mt-4 text-lg leading-relaxed">
                Soit ton relevé est propre, soit il couvre trop peu de mois.
                Avec 3 mois ou plus, la détection est plus fiable.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
                {fantomes.length}{" "}
                {fantomes.length > 1 ? "fantômes possibles" : "fantôme possible"}
                , soit{" "}
                <span className="text-[#b8452e]">{eur0.format(total)}</span> par
                an.
              </h1>
              <p className="mt-4 leading-relaxed text-[#1c1917]/70">
                Classés du plus coûteux au moins coûteux, sur une année. À toi
                de voir lesquels tu utilises vraiment.
              </p>

              <ul className="mt-8 space-y-3">
                {fantomes.map((f, i) => (
                  <li
                    key={f.nom}
                    className="rounded-2xl border border-[#1c1917]/15 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[#1c1917]/50">#{i + 1}</p>
                        <h2 className="font-serif text-xl font-bold">
                          {f.nom}
                        </h2>
                        <p className="mt-1 text-sm text-[#1c1917]/60">
                          {eur2.format(f.mensuel)} par mois · vu {f.occurrences}{" "}
                          fois
                        </p>
                        <p className="mt-1 text-xs text-[#1c1917]/40">
                          {f.libelle}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-serif text-2xl text-[#b8452e]">
                        {eur0.format(f.annuel)}
                        <span className="block text-right text-xs text-[#1c1917]/50">
                          par an
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            onClick={recommencer}
            className="mt-8 min-h-12 text-[#1c1917]/60 underline"
          >
            Analyser un autre fichier
          </button>
        </>
      )}
    </main>
  );
}
