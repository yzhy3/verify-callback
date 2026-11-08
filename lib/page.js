export function page(title, text, accent = '#9b5cff') {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box;margin:0}
body{font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;padding:24px;text-align:center}
.c{max-width:420px;width:100%;background:#15151f;border:1px solid #2a2a3a;border-radius:16px;padding:28px}
h1{font-size:1.3rem;margin-bottom:10px;color:${accent}}
p{color:#a5a5b8;line-height:1.55}
a{color:${accent}}
</style></head><body><div class="c"><h1>${title}</h1><p>${text}</p></div></body></html>`;
}