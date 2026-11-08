import crypto from 'node:crypto';

export default function handler(req, res) {
  const s = process.env.SESSION_SECRET || '';
  res.status(200).json({
    len: s.length,
    hash: crypto.createHash('sha256').update(s).digest('hex').slice(0, 12),
    publicUrl: process.env.PUBLIC_URL || null,
    guildId: process.env.GUILD_ID || null,
    hasToken: Boolean(process.env.DISCORD_TOKEN),
    hasSecret: Boolean(process.env.CLIENT_SECRET),
    hasRole: Boolean(process.env.VERIFIED_ROLE_ID),
  });
}