import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../functions/api/contact.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'sender@example.com', CONTACT_TO_EMAIL: 'owner@example.com' };
const valid = { name: ' Ada ', email: 'ada@example.com', message: ' Hello ' };
let nextIP = 0;
function submit(body = valid, options = {}) {
  return onRequest({ env, request: new Request('https://portfolio.pages.dev/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': String(++nextIP) },
    body: JSON.stringify(body), ...options,
  }) });
}

test('contact validation and bounded request parsing never invoke the provider', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected provider call'); };
  try {
    assert.equal((await onRequest({ env, request: new Request('https://example.com/api/contact') })).status, 405);
    assert.equal((await submit(valid, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await submit(valid, { body: '{' })).status, 400);
    assert.equal((await submit({ ...valid, name: 42 })).status, 400);
    assert.equal((await submit({ ...valid, extra: 'unexpected' })).status, 400);
    assert.equal((await submit({ ...valid, message: 'x'.repeat(17000) })).status, 400);
    const invalid = await submit({ name: '', email: 'ada@localhost', message: '' });
    assert.equal(invalid.status, 422);
    assert.deepEqual(Object.keys((await invalid.json()).errors).sort(), ['email', 'message', 'name']);
    assert.equal((await onRequest({ env: {}, request: new Request('https://example.com/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid),
    }) })).status, 503);
  } finally { globalThis.fetch = original; }
});

test('provider acceptance, failure, and throttling match the form contract', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(options.headers.Authorization, 'Bearer test-key');
      assert.deepEqual(JSON.parse(options.body), {
        from: env.CONTACT_FROM_EMAIL, to: [env.CONTACT_TO_EMAIL],
        subject: 'New message from your portfolio', text: 'Name: Ada\nEmail: ada@example.com\n\nHello',
      });
      return Response.json({ id: 'fake-receipt' });
    };
    const accepted = await submit();
    assert.equal(accepted.status, 200);
    assert.equal(accepted.headers.get('Cache-Control'), 'no-store');
    assert.equal((await accepted.json()).message, 'Message sent');
    for (const fake of [
      async () => new Response('provider error', { status: 500 }),
      async () => Response.json({}),
      async () => { throw new Error('Network failure'); },
    ]) {
      globalThis.fetch = fake;
      assert.equal((await submit()).status, 502);
    }
    globalThis.fetch = async () => Response.json({ id: 'fake-receipt' });
    const options = { headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': 'rate-test' } };
    for (let i = 0; i < 5; i++) assert.equal((await submit(valid, options)).status, 200);
    const limited = await submit(valid, options);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  } finally { globalThis.fetch = original; }
});
