import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Auth Utilities ---
const generateToken = (user: any) =>
    jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );

const verifyToken = (token: string) =>
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

const getUser = (req: VercelRequest) => {
    const auth = req.headers['authorization'];
    if (!auth) return null;
    try {
        const token = auth.split(' ')[1];
        return verifyToken(token);
    } catch {
        return null;
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = (req.url || '').split('?')[0];
    const rawMethod = req.method || 'GET';
    const sql = neon(process.env.DATABASE_URL!);

    try {
        // --- PUBLIC TOOLS ---
        if (url.includes('/api/debug')) {
            const hash = await bcrypt.hash('test', 10);
            return res.json({
                received_url: url,
                original_url: req.url,
                method: rawMethod,
                headers: req.headers,
                lib_test: { bcrypt: !!hash, jwt: !!jwt.sign },
                env_check: {
                    has_db: !!process.env.DATABASE_URL,
                    has_google: !!process.env.GOOGLE_CLIENT_ID,
                    node_version: process.version
                }
            });
        }

        if (url === '/api/health' || url.includes('/health')) {
            await sql`SELECT 1`;
            return res.json({ status: 'ok', database: 'connected' });
        }

        // --- CATEGORIES ---
        if (url === '/api/categories' && rawMethod === 'GET') {
            const cats = await sql`SELECT * FROM categories ORDER BY name ASC`;
            return res.json(cats);
        }

        // --- WORKERS ---
        if (url === '/api/workers' && rawMethod === 'GET') {
            const { q, category } = req.query;
            let workers;
            if (!q && !category) {
                workers = await sql`SELECT * FROM workers WHERE is_active = TRUE ORDER BY created_at DESC`;
            } else {
                workers = await sql`
                    SELECT w.* FROM workers w 
                    WHERE w.is_active = TRUE 
                    AND (w.name ILIKE ${'%' + (q || '') + '%'} OR w.job ILIKE ${'%' + (q || '') + '%'})
                    ORDER BY w.created_at DESC
                `;
            }
            return res.json(workers);
        }

        // Worker Detail (Handling both /api/workers/123 and /api/worker-details)
        const workerDetailMatch = url.match(/^\/api\/workers\/(\d+)$/);
        if ((workerDetailMatch || url === '/api/worker-details') && rawMethod === 'GET') {
            const id = workerDetailMatch ? workerDetailMatch[1] : req.query.id;
            const workerResult = await sql`SELECT * FROM workers WHERE id = ${id}`;
            if (workerResult.length === 0) return res.status(404).json({ error: 'Worker not found' });
            const reviews = await sql`SELECT * FROM reviews WHERE worker_id = ${id} ORDER BY created_at DESC`;
            return res.json({ ...workerResult[0], reviews });
        }

        // --- REVIEWS ---
        if (url === '/api/reviews' && rawMethod === 'POST') {
            const { worker_id, name, rating, comment, date } = req.body;
            const review = await sql`
                INSERT INTO reviews (worker_id, name, rating, comment, date)
                VALUES (${worker_id}, ${name}, ${rating}, ${comment}, ${date})
                RETURNING *
            `;
            await sql`
                UPDATE workers SET
                    rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = ${worker_id}),
                    reviews_count = (SELECT COUNT(*) FROM reviews WHERE worker_id = ${worker_id})
                WHERE id = ${worker_id}
            `;
            return res.status(201).json(review[0]);
        }

        // --- CONTACT ---
        if (url === '/api/contact' && rawMethod === 'POST') {
            const { worker_id, customer_name, customer_phone, message } = req.body;
            const result = await sql`
                INSERT INTO contact_requests (worker_id, customer_name, customer_phone, message)
                VALUES (${worker_id}, ${customer_name}, ${customer_phone}, ${message})
                RETURNING *
            `;
            return res.status(201).json(result[0]);
        }

        // --- AUTH ---
        if (url === '/api/auth/register' && rawMethod === 'POST') {
            const { name, email, password, role } = req.body;
            const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
            if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const newUser = await sql`
                INSERT INTO users (name, email, password_hash, role)
                VALUES (${name}, ${email}, ${hashed}, ${role || 'seeker'})
                RETURNING id, name, email, role
            `;
            return res.status(201).json({ user: newUser[0], token: generateToken(newUser[0]) });
        }

        if (url === '/api/auth/login' && rawMethod === 'POST') {
            const { email, password } = req.body;
            const users = await sql`SELECT * FROM users WHERE email = ${email}`;
            if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
            const valid = await bcrypt.compare(password, users[0].password_hash);
            if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
            return res.json({
                user: { id: users[0].id, name: users[0].name, email: users[0].email, role: users[0].role },
                token: generateToken(users[0])
            });
        }

        if (url === '/api/auth/me' && rawMethod === 'GET') {
            const user = getUser(req);
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ user });
        }

        if (url === '/api/auth/google') {
            const { role } = req.query;
            const state = encodeURIComponent(JSON.stringify({ role: role || 'seeker' }));
            const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.CALLBACK_URL!)}&response_type=code&scope=profile%20email&state=${state}`;
            return res.redirect(302, googleUrl);
        }

        if (url === '/api/auth/google/callback') {
            const { code, state } = req.query;
            
            if (!code) return res.status(400).json({ error: 'OAuth code missing from Google' });
            if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
                return res.status(500).json({ error: 'Google Credentials not configured in Vercel' });
            }

            let role = 'seeker';
            try {
                if (state) {
                    const parsedState = JSON.parse(decodeURIComponent(state as string));
                    role = parsedState.role || 'seeker';
                }
            } catch (e) {
                console.warn('Failed to parse OAuth state, defaulting to seeker');
            }

            // 1. Exchange code for token
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: code as string,
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    redirect_uri: process.env.CALLBACK_URL!,
                    grant_type: 'authorization_code'
                })
            });

            if (!tokenRes.ok) {
                const errorDetail = await tokenRes.text();
                return res.status(500).json({ error: 'Google Token Exchange Failed', details: errorDetail });
            }

            const tokens = await tokenRes.json();

            // 2. Get user profile
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });

            if (!userRes.ok) return res.status(500).json({ error: 'Failed to fetch user profile from Google' });
            
            const googleUser = await userRes.json();
            if (!googleUser.email) return res.status(500).json({ error: 'Google did not return an email' });

            // 3. Upsert user in DB
            let user;
            try {
                const users = await sql`SELECT * FROM users WHERE email = ${googleUser.email}`;
                if (users.length === 0) {
                    const newUser = await sql`
                        INSERT INTO users (name, email, role)
                        VALUES (${googleUser.name || 'Google User'}, ${googleUser.email}, ${role})
                        RETURNING id, name, email, role
                    `;
                    user = newUser[0];
                } else {
                    user = { id: users[0].id, name: users[0].name, email: users[0].email, role: users[0].role };
                }
            } catch (dbError: any) {
                return res.status(500).json({ error: 'Database error during Google Login', message: dbError.message });
            }

            // 4. Generate and redirect
            const token = generateToken(user);
            const clientUrl = process.env.CLIENT_URL || 'https://worker-find.vercel.app';
            // Ensure no double slashes or missing slashes
            const redirectBase = clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl;
            return res.redirect(302, `${redirectBase}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        }

        return res.status(404).json({ error: 'Route not found', url });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
