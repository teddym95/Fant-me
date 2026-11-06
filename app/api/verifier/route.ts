import Stripe from "stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id") ?? "";

  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ paye: false }, { status: 400 });
  }

  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    return NextResponse.json({ paye: false }, { status: 500 });
  }

  try {
    const stripe = new Stripe(cle);
    const session = await stripe.checkout.sessions.retrieve(id);
    const paye =
      session.payment_status === "paid" &&
      session.amount_total === 1900 &&
      session.currency === "eur";
    return NextResponse.json({ paye });
  } catch {
    return NextResponse.json({ paye: false }, { status: 500 });
  }
}
