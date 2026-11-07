// Posts one tweet to X for each app newly added to ai-lab/apps.json in the latest commit.
// Uses OAuth 1.0a user context (X API v2 POST /2/tweets). No dependencies.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHmac, randomBytes } from 'node:crypto';

const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');

if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
  console.log('X secrets are not set; skipping tweet.');
  process.exit(0);
}
if (!SITE_URL) { console.error('SITE_URL is empty'); process.exit(1); }

const now = JSON.parse(readFileSync('ai-lab/apps.json', 'utf8'));
let before = [];
try { before = JSON.parse(execSync('git show HEAD~1:ai-lab/apps.json', { encoding: 'utf8' })); } catch { /* first commit */ }
const known = new Set(before.map(a => a.slug));
const fresh = now.filter(a => !known.has(a.slug));
if (!fresh.length) { console.log('No new apps in this commit.'); process.exit(0); }

const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function authHeader(method, url) {
  const p = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  const params = Object.keys(p).sort().map(k => `${enc(k)}=${enc(p[k])}`).join('&');
  const base = [method, enc(url), enc(params)].join('&');
  const key = `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`;
  p.oauth_signature = createHmac('sha1', key).update(base).digest('base64');
  return 'OAuth ' + Object.keys(p).sort().map(k => `${enc(k)}="${enc(p[k])}"`).join(', ');
}

function compose(app) {
  const url = `${SITE_URL}/ai-lab/apps/${app.slug}/`;
  // X counts any URL as 23 chars; keep the rest well under 280.
  let body = `${app.emoji} ${app.title}\n${app.description}`;
  if (body.length > 200) body = body.slice(0, 199) + '…';
  return `${body}\n\n#AI #AIニュース\n${url}`;
}

let failed = false;
for (const app of fresh) {
  const url = 'https://api.x.com/2/tweets';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authHeader('POST', url), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: compose(app) }),
  });
  const text = await res.text();
  if (res.ok) console.log(`Tweeted ${app.slug}: ${text}`);
  else { console.error(`Failed ${app.slug}: ${res.status} ${text}`); failed = true; }
}
process.exit(failed ? 1 : 0);
