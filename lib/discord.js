import { config } from './config.js';

const API = 'https://discord.com/api/v10';

function botHeaders() {
  return {
    Authorization: `Bot ${config.token}`,
    'Content-Type': 'application/json',
  };
}

export async function exchangeCode(code) {
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${config.publicUrl}/api/verify/callback`,
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
  if (!config.logChannelId) return;
  await fetch(`${API}/channels/${config.logChannelId}/messages`, {
    method: 'POST',
    headers: botHeaders(),
    body: JSON.stringify({ content: `✅ <@${userId}> verificado` }),
  }).catch(() => {});
}

export async function verifyTurnstile(token, ip) {
  if (!config.turnstileSecret) return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: config.turnstileSecret,
      response: token || '',
      remoteip: ip || '',
    }),
  });
  const json = await res.json();
  return Boolean(json.success);
}

export function authorizeUrl(state) {
  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', `${config.publicUrl}/api/verify/callback`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify guilds.join');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function finish(guildId, userId, accessToken) {
  await joinGuild(guildId, userId, accessToken);

  if (config.verifiedRoleId) {
    await grantRole(guildId, userId, config.verifiedRoleId);
  }

  for (const pg of config.partnerGuildIds) {
    await joinGuild(pg, userId, accessToken);
  }

  await logVerify(userId);
}