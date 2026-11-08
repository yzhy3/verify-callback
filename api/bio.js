import { config } from '../lib/config.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60');
  res.status(200).json({
    bio: config.bioText,
    invite: config.serverInvite,
    server: config.serverName,
  });
}