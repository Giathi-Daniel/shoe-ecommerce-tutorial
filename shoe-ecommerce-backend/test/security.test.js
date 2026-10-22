const test = require('node:test');
const assert = require('node:assert/strict');
const { maskEmail } = require('../utils/mask');
const sanitizeRequest = require('../middleware/sanitizeRequest');
const verifyRecaptcha = require('../middleware/recaptcha');

const run = async (middleware, req) => {
  const result = { status: null, body: null, nextCalled: false };
  const res = {
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; return this; },
  };
  await middleware(req, res, () => { result.nextCalled = true; });
  return result;
};

const withEnv = async (vars, fn) => {
  const previous = {};
  for (const [key, value] of Object.entries(vars)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  try { return await fn(); } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
};

const google = (payload, ok = true) => async () => ({ ok, json: async () => payload });

test('maskEmail hides the local part', () => {
  assert.equal(maskEmail('daniel@gmail.com'), 'd***@gmail.com');
  assert.equal(maskEmail('nonsense'), '***');
});

test('sanitizeRequest rejects Mongo operators in body, query and params', async () => {
  for (const req of [
    { body: { email: { $gt: '' } }, query: {}, params: {} },
    { body: {}, query: { category: { $ne: 'x' } }, params: {} },
    { body: { 'a.b': 1 }, query: {}, params: {} },
    { body: { nested: { deep: { $where: '1' } } }, query: {}, params: {} },
  ]) {
    const result = await run(sanitizeRequest, req);
    assert.equal(result.status, 400);
    assert.equal(result.nextCalled, false);
  }
  const ok = await run(sanitizeRequest, { body: { email: 'a@b.com' }, query: { q: 'shoe' }, params: { id: '1' } });
  assert.equal(ok.nextCalled, true);
});

test('recaptcha fails closed in production without a secret', async () => {
  await withEnv({ NODE_ENV: 'production', RECAPTCHA_SECRET_KEY: undefined }, async () => {
    const result = await run(verifyRecaptcha('login'), { body: {}, ip: '1.1.1.1' });
    assert.equal(result.status, 503);
  });
});

test('recaptcha is skipped in development without a secret', async () => {
  await withEnv({ NODE_ENV: 'development', RECAPTCHA_SECRET_KEY: undefined }, async () => {
    assert.equal((await run(verifyRecaptcha('login'), { body: {}, ip: '1.1.1.1' })).nextCalled, true);
  });
});

test('recaptcha accepts a good token and strips it from the body', async () => {
  await withEnv({ NODE_ENV: 'production', RECAPTCHA_SECRET_KEY: 's' }, async () => {
    const req = { body: { recaptchaToken: 'tok', email: 'a@b.com' }, ip: '1.1.1.1' };
    const result = await run(verifyRecaptcha('login', { fetchImpl: google({ success: true, score: 0.9, action: 'login' }) }), req);
    assert.equal(result.nextCalled, true);
    assert.equal('recaptchaToken' in req.body, false);
  });
});

test('recaptcha rejects low scores, wrong actions, missing tokens and outages', async () => {
  await withEnv({ NODE_ENV: 'production', RECAPTCHA_SECRET_KEY: 's' }, async () => {
    const body = { recaptchaToken: 'tok' };
    for (const payload of [
      { success: true, score: 0.1, action: 'login' },
      { success: true, score: 0.9, action: 'register' },
      { success: false },
    ]) {
      const result = await run(verifyRecaptcha('login', { fetchImpl: google(payload) }), { body: { ...body }, ip: 'x' });
      assert.equal(result.status, 403);
    }
    assert.equal((await run(verifyRecaptcha('login'), { body: {}, ip: 'x' })).status, 400);
    const down = async () => { throw new Error('network'); };
    assert.equal((await run(verifyRecaptcha('login', { fetchImpl: down }), { body: { ...body }, ip: 'x' })).status, 403);
  });
});
