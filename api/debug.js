import crypto from 'node:crypto';
import { config } from '../lib/config.js';

export default function handler(req, res) {
  res.status(200).json({
    len: config.sessionSecret.length,
    hash: crypto.createHash('sha256').update(config.sessionSecret).digest('hex').slice(0, 12),
    publicUrl: config.publicUrl,
    guildId: config.guildId,
    hasToken: Boolean(config.token),
    hasSecret: Boolean(config.clientSecret),
    hasRole: Boolean(config.verifiedRoleId),
    minAgeDays: config.minAgeDays,
  });
}