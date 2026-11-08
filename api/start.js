import { verifyPayload } from '../../lib/state.js';
import { authorizeUrl } from '../../lib/discord.js';

export default function handler(req, res) {
  const { state } = req.query;
  const data = verifyPayload(state);

  if (!data) {
    return res.status(400).send(page('Enlace inválido', 'Vuelve a Discord y pulsa Verificar otra vez.'));
  }

  res.redirect(302, authorizeUrl(state));
}

function page(title, text) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
.c{max-width:400px;background:#15151f;border:1px solid #2a2a3a;border-radius:16px;padding:28px}
h1{font-size:1.3rem}p{color:#a5a5b8}</style></head>
<body><div class="c"><h1>${title}</h1><p>${text}</p></div></body></html>`;
}