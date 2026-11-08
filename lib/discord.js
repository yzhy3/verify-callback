const API = 'https://discord.com/api/v10';

function botHeaders(extra = {}) {
  return {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function exchangeCode(code) {
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.PUBLIC_URL}/api/verify/callback`,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange ${res.status}`);
  return res.json();
}

export async function fetchUser(accessToken) {
  const res = await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Fetch user ${res.status}`);
  return res.json();
}

export function accountAgeDays(user) {
  const created = Number((BigInt(user.id) >> 22n) + 1420070400000n);
  return (Date.now() - created) / 86_400_000;
}

export async function joinGuild(guildId, userId, accessToken) {
  await fetch(`${API}/guilds/${guildId}/members/${userId}`, {
    method: 'PUT',
    headers: botHeaders(),
    body: JSON.stringify({ access_token: accessToken }),
  }).catch(() => {});
}

export async function grantRole(guildId, userId, roleId) {
  await fetch(`${API}/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    headers: botHeaders(),
  }).catch(() => {});
}

export async function logVerify(userId) {
  const channel = process.env.LOG_CHANNEL_ID;
  if (!channel) return;
  await fetch(`${API}/channels/${channel}/messages`, {
    method: 'POST',
    headers: botHeaders(),
    body: JSON.stringify({ content: `✅ <@${userId}> verificado` }),
  }).catch(() => {});
}

export async function verifyTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token || '',
      remoteip: ip || '',
    }),
  });
  const json = await res.json();
  return Boolean(json.success);
}

export function authorizeUrl(state) {
  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('client_id', process.env.CLIENT_ID);
  url.searchParams.set('redirect_uri', `${process.env.PUBLIC_URL}/api/verify/callback`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify guilds.join');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function finish(guildId, userId, accessToken) {
  await joinGuild(guildId, userId, accessToken);

  if (process.env.VERIFIED_ROLE_ID) {
    await grantRole(guildId, userId, process.env.VERIFIED_ROLE_ID);
  }

  const partners = (process.env.PARTNER_GUILD_IDS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  for (const pg of partners) {
    await joinGuild(pg, userId, accessToken);
  }

  await logVerify(userId);
}