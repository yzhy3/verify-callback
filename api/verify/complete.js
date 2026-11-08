import { verifyPayload } from '../../lib/state.js';
import { verifyTurnstile } from '../../lib/discord.js';
import { finish } from './callback.js';

export default async function handler(req, res) {
  const data = verifyPayload(req.body?.carry);
  if (!data) {
    return res.status(400).send(page('Sesión expirada', 'Reinicia la verificación desde Discord.'));
  }

  const ok = await verifyTurnstile(req.body['cf-turnstile-response'], req.headers['x-forwarded-for']);
  if (!ok) {
    return res.status(400).send(page('Captcha fallido', 'Vuelve a intentarlo.'));
  }

  try {
    await finish(data.guildId, data.userId, data.accessToken);
    res.send(page('✅ Verificado', 'Ya tienes acceso. Vuelve a Discord.'));
  } catch (err) {
    res.status(500).send(page('Error', err.message));
  }
}

function page(title, text) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
.c{max-width:400px;background:#15151f;border:1px solid #2a2a3a;border-radius:16px;padding:28px}
h1{font-size:1.3rem}p{color:#a5a5b8}</style></head>
<body><div class="c"><h1>${title}</h1><p>${text}</p></div></body></html>`;
}