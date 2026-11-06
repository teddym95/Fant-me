import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    return NextResponse.json(
      { erreur: "Le paiement est momentanément indisponible." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(cle);
  const hote = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const protocole = req.headers.get("x-forwarded-proto") ?? "https";

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: 1900,
            product_data: {
              name: "Fantômes : audit complet",
              description: "Toutes tes lettres de résiliation, débloquées.",
            },
          },
        },
      ],
      return_url: `${protocole}://${hote}/merci?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch {
    return NextResponse.json(
      { erreur: "Impossible de lancer le paiement. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
