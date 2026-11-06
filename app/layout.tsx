import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Fantômes : débusque les abonnements que tu paies sans t'en servir",
  description:
    "Dépose ton relevé bancaire, vois quels prélèvements tournent pour rien et résilie en un clic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
