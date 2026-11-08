import { verifyPayload, signPayload } from '../../lib/state.js';
import {
  exchangeCode, fetchUser, accountAgeDays, finish, authorizeUrl,
} from '../../lib/discord.js';
import { page } from '../../lib/page.js';

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!verifyPayload(state) || !code) {
    return res.status(400).send(page(
      'Sesión expirada',
      'Reinicia la verificación desde Discord.',
      '#ff7b7b'
    ));
  }

  const data = verifyPayload(state);

  try {
    const token = await exchangeCode(code);
    const user = await fetchUser(token.access_token);

    if (user.id !== data.userId) {
      return res.status(400).send(page(
        'Usuario no coincide',
        'Vuelve a empezar desde Discord.',
        '#ff7b7b'
      ));
    }

    const age = accountAgeDays(user);
    const minAge = Number(process.env.MIN_ACCOUNT_AGE_DAYS || 7);

    if (age < minAge) {
      return res.status(403).send(page(
        'Cuenta demasiado nueva',
        `Tu cuenta tiene ${Math.floor(age)} días y se requieren ${minAge}.`,
        '#ff7b7b'
      ));
    }

    if (process.env.TURNSTILE_SITE_KEY) {
      const carry = signPayload({
        userId: data.userId,
        guildId: data.guildId,
        accessToken: token.access_token,
      }, 5 * 60_000);

      return res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Último paso</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box;margin:0}
body{font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;padding:24px}
.c{max-width:420px;width:100%;background:#15151f;border:1px solid #2a2a3a;border-radius:16px;padding:28px}
h1{font-size:1.3rem;margin-bottom:10px}
p{color:#a5a5b8}
button{width:100%;margin-top:16px;background:linear-gradient(135deg,#9b5cff,#ff3d81);color:#fff;border:0;border-radius:10px;padding:13px;font-weight:600;cursor:pointer}
</style></head><body><div class="c">
<h1>Último paso</h1><p>Resuelve la verificación anti-bot.</p>
<form method="POST" action="/api/verify/complete">
<input type="hidden" name="carry" value="${carry}">
<div class="cf-turnstile" data-sitekey="${process.env.TURNSTILE_SITE_KEY}"></div>
<button type="submit">Completar</button>
</form></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</body></html>`);
    }

    await finish(data.guildId, user.id, token.access_token);
    res.send(page('✅ Verificado', 'Ya tienes acceso. Vuelve a Discord.'));
  } catch (err) {
    console.error(err);
    res.status(500).send(page('Error', err.message, '#ff7b7b'));
  }
}