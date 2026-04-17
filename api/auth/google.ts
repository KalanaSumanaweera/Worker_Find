import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { role } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.CALLBACK_URL;

    if (!clientId || !callbackUrl) {
        return res.status(500).json({ error: 'Google OAuth configuration missing' });
    }

    const state = encodeURIComponent(JSON.stringify({ role: role || 'seeker' }));
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=profile%20email&state=${state}`;

    return res.redirect(302, googleUrl);
}
