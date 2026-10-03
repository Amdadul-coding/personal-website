interface Env {
  RESEND_API_KEY: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
}

// Best-effort protection within each isolate; counters reset on eviction and
// are not shared across Cloudflare locations or concurrent isolates.
const visitors = new Map<string, { count: number; reset: number }>();
const maxBytes = 16 * 1024;

function reply(status: number, message: string, errors?: Record<string, string>, retry?: number) {
  return new Response(JSON.stringify({ message, ...(errors ? { errors } : {}) }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...(status === 405 ? { Allow: 'POST' } : {}),
      ...(retry ? { 'Retry-After': String(retry) } : {}),
    },
  });
}

async function readSubmission(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('Missing body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== 'POST') return reply(405, 'Please submit the form using POST.');
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reply(415, 'Please send the form as JSON.');
  }
  let data: unknown;
  try {
    data = await readSubmission(request);
  } catch {
    return reply(400, 'Invalid form data. Keep the request under 16 KB and use text fields.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, 'Invalid form data.');
  const fields = data as Record<string, unknown>;
  if (Object.keys(fields).some((key) => !['name', 'email', 'message'].includes(key)) ||
      Object.values(fields).some((value) => typeof value !== 'string')) {
    return reply(400, 'Invalid form data. Use text fields only.');
  }
  const name = ((fields.name as string | undefined) ?? '').trim();
  const email = ((fields.email as string | undefined) ?? '').trim();
  const message = ((fields.message as string | undefined) ?? '').trim();
  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Please enter your name.';
  if (!message) errors.message = 'Please write a message.';
  if (!email) errors.email = 'Please enter your email.';
  else if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) errors.email = 'Please enter your email address.';
  if (Object.keys(errors).length) return reply(422, '', errors);

  const now = Date.now();
  for (const [key, entry] of visitors) if (entry.reset <= now) visitors.delete(key);
  // Cloudflare supplies this header at its ingress. Never use a client-supplied
  // X-Forwarded-For value to identify visitors.
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const entry = visitors.get(ip) ?? { count: 0, reset: now + 600_000 };
  if (entry.count >= 5 || (!visitors.has(ip) && visitors.size >= 10_000)) {
    return reply(429, 'Too many submissions.', undefined, Math.max(1, Math.ceil((entry.reset - now) / 1000)));
  }
  entry.count++;
  visitors.set(ip, entry);

  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !from || !to) {
    return reply(503, 'The contact form is temporarily unavailable. Please try again later.');
  }
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [to], subject: 'New message from your portfolio',
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) throw new Error('Provider rejected email');
    const receipt = await result.json() as { id?: unknown };
    if (typeof receipt.id !== 'string' || !receipt.id) throw new Error('Missing receipt');
  } catch {
    // Do not log provider bodies, credentials, or visitor messages.
    return reply(502, 'Unable to send your message right now. Please try again later.');
  }
  return reply(200, 'Message sent');
}
