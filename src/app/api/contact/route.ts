// Server-side contact form handler
// Called by: ContactContent.tsx form submission

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

// ── Request validation ──────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

// ── EmailJS server-side send ────────────────────────────────────────────────

async function sendEmail(params: { name: string; email: string; message: string }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS configuration missing");
  }

  const body: Record<string, unknown> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: params,
  };
  if (privateKey) body.accessToken = privateKey;

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS error: ${res.status} — ${text}`);
  }
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json();
    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await sendEmail(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
