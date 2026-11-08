export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60');
  res.status(200).json({
    bio: process.env.BIO_TEXT || `Únete → ${process.env.SERVER_INVITE}`,
    invite: process.env.SERVER_INVITE,
    server: process.env.SERVER_NAME || 'el servidor',
  });
}