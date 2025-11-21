import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrUpdateContact, getBrevoContactsClient } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as any;
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(body);

    // Check if contact already exists
    try {
      const client = getBrevoContactsClient();
      if (client) {
        await client.getContactInfo(email);
        return NextResponse.json({ success: true, already: true });
      }
    } catch {
      // getContactInfo throws if not found -> we proceed to create
    }

    const res = await createOrUpdateContact(email);
    if (!res.ok) {
      // Still return 200 to avoid leaking provider errors, but include message
      return NextResponse.json({ success: false, message: res.reason || "Unable to subscribe now." }, { status: 200 });
    }

    return NextResponse.json({ success: true, already: false });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Email invalide" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
