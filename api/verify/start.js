import { verifyPayload } from '../../lib/state.js';
import { authorizeUrl } from '../../lib/discord.js';
import { page } from '../../lib/page.js';

export default function handler(req, res) {
  const { state } = req.query;

  if (!verifyPayload(state)) {
    return res.status(400).send(page(
      'Enlace inválido',
      'Vuelve a Discord y pulsa Verificar otra vez.',
      '#ff7b7b'
    ));
  }

  res.redirect(302, authorizeUrl(state));
}