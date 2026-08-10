import { NextResponse } from 'next/server';
import { chatMessageSchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SYSTEM_PROMPT = `You are Ask LAXValetCare, the in-app assistant for LAXValetCare (airport valet
at LAX + vehicle rentals + car care add-ons for valet clients). Be concise and friendly.
Pricing: Standard valet $46.95/day, VIP Express +$500/person, VIP Elite +$2,000/person.
Car care add-ons (valet clients only): Hand Wash $69.95, Full Detail $499.95, EV Charge $45.95.
Rentals: Economy $45/day, Standard $65, SUV $85, Premium $120, Luxury $200, Van $150/day;
weekly/monthly discounts apply. Terminals 1-8 plus TBIT (Terminal B); Terminal 5 is closed
until 2028. If the customer wants something you can't resolve, tell them you're connecting
them to a human and to expect a reply within about 5 minutes.`;

/** Sends a customer message; replies with Claude unless the thread has been escalated to a human. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  let threadId = parsed.data.threadId;
  if (!threadId) {
    const { data: thread } = await admin.from('chat_threads').insert({ id: crypto.randomUUID(), customerId: user.id }).select().single();
    threadId = thread!.id;
  }
  const { data: thread } = await admin.from('chat_threads').select('*').eq('id', threadId).single();

  await admin.from('chat_messages').insert({ id: crypto.randomUUID(), threadId, sender: 'CUSTOMER', body: parsed.data.body });

  if (thread?.status === 'HUMAN_ACTIVE' || thread?.status === 'HUMAN_REQUESTED') {
    await admin.from('chat_threads').update({ lastMessageAt: new Date().toISOString() }).eq('id', threadId);
    return NextResponse.json({ threadId, reply: null, handedOff: true });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const fallback = "Thanks for your message! Our AI assistant isn't fully configured yet — tap \"Talk to a human\" and our team will help.";
    await admin.from('chat_messages').insert({ id: crypto.randomUUID(), threadId, sender: 'AI', body: fallback });
    return NextResponse.json({ threadId, reply: fallback });
  }

  const { data: history } = await admin.from('chat_messages').select('sender, body').eq('threadId', threadId).order('createdAt', { ascending: true }).limit(20);

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: (history ?? []).map((m) => ({ role: m.sender === 'CUSTOMER' ? 'user' : 'assistant', content: m.body })),
  });
  const reply = response.content.find((c) => c.type === 'text')?.text ?? "Sorry, I didn't catch that — could you rephrase?";

  await admin.from('chat_messages').insert({ id: crypto.randomUUID(), threadId, sender: 'AI', body: reply });
  await admin.from('chat_threads').update({ lastMessageAt: new Date().toISOString() }).eq('id', threadId);

  return NextResponse.json({ threadId, reply });
}
