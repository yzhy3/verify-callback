import { verifyPayload } from '../../lib/state.js';
import { verifyTurnstile, finish } from '../../lib/discord.js';
import { page } from '../../lib/page.js';

export default async function handler(req, res) {
  const data = verifyPayload(req.body?.carry);

  if (!data) {
    return res.status(400).send(page(
      'Sesión expirada',
      'Reinicia la verificación desde Discord.',
      '#ff7b7b'
    ));
  }

  const ok = await verifyTurnstile(
    req.body['cf-turnstile-response'],
    req.headers['x-forwarded-for']
  );

  if (!ok) {
    return res.status(400).send(page('Captcha fallido', 'Vuelve a intentarlo.', '#ff7b7b'));
  }

  try {
    await finish(data.guildId, data.userId, data.accessToken);
    res.send(page('✅ Verificado', 'Ya tienes acceso. Vuelve a Discord.'));
  } catch (err) {
    console.error(err);
    res.status(500).send(page('Error', err.message, '#ff7b7b'));
  }
}