import { NextRequest, NextResponse } from "next/server";
import { couponSchema } from "@/lib/validation";
import { resolveCoupon } from "@/lib/coupon";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limitResult = rateLimit(`coupon:${ip}`, { limit: 20, windowMs: 10 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { valid: false, reason: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 }
    );
  }

  const parsed = couponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ valid: false, reason: "Requête invalide." }, { status: 400 });
  }

  const result = await resolveCoupon(parsed.data.code, parsed.data.subtotalCents);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason });
  }

  return NextResponse.json({
    valid: true,
    discountCents: result.discountCents,
  });
}
