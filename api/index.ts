import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- DB Helper ---
const getDb = () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    return neon(process.env.DATABASE_URL);
};

// --- Auth Helpers ---
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
    try { return verifyToken(auth.split(' ')[1]); } catch { return null; }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = (req.url || '').split('?')[0];
    const query = req.query;
    const method = req.method || 'GET';

    try {
        const sql = getDb();

        // ---- HEALTH ----
        if (url === '/api/health') {
            await sql`SELECT 1`;
            return res.json({ status: 'ok', database: 'connected' });
        }

        // ---- CATEGORIES ----
        if (url === '/api/categories' && method === 'GET') {
            const cats = await sql`SELECT * FROM categories ORDER BY name ASC`;
            return res.json(cats);
        }

        // ---- WORKERS ----
        if (url === '/api/workers' && method === 'GET') {
            const { q, category, province, district, rating } = query;
            let workers;
            if (!q && !category && !province && !district && !rating) {
                workers = await sql`SELECT DISTINCT w.* FROM workers w WHERE w.is_active = TRUE ORDER BY w.created_at DESC`;
            } else {
                workers = await sql.unsafe(`
                    SELECT DISTINCT w.*
                    FROM workers w
                    LEFT JOIN worker_categories wc ON w.id = wc.worker_id
                    LEFT JOIN categories c ON wc.category_id = c.id
                    WHERE w.is_active = TRUE
                    ${q ? `AND (w.name ILIKE '%${q}%' OR w.job ILIKE '%${q}%' OR c.name ILIKE '%${q}%')` : ''}
                    ${category ? `AND (c.name ILIKE '%${category}%' OR c.slug = '${category}')` : ''}
                    ${province ? `AND w.province = '${province}'` : ''}
                    ${district ? `AND w.city ILIKE '%${district}%'` : ''}
                    ${rating ? `AND w.rating >= ${rating}` : ''}
                    ORDER BY w.created_at DESC
                `);
            }
            return res.json(workers);
        }

        if (url === '/api/workers' && method === 'POST') {
            const { name, job, price, province, city, story, services, image_url, phone, email, category_ids } = req.body;
            const result = await sql`
                INSERT INTO workers (name, job, price, province, city, story, services, image_url, phone, email)
                VALUES (${name}, ${job}, ${price}, ${province}, ${city}, ${story}, ${services}, ${image_url}, ${phone}, ${email})
                RETURNING *
            `;
            if (category_ids && Array.isArray(category_ids)) {
                for (const catId of category_ids) {
                    await sql`INSERT INTO worker_categories (worker_id, category_id) VALUES (${result[0].id}, ${catId})`;
                }
            }
            return res.status(201).json(result[0]);
        }

        // Worker by ID
        const workerMatch = url.match(/^\/api\/workers\/(\d+)$/);
        if (workerMatch && method === 'GET') {
            const id = workerMatch[1];
            const workerResult = await sql`SELECT * FROM workers WHERE id = ${id}`;
            if (workerResult.length === 0) return res.status(404).json({ error: 'Worker not found' });
            const reviews = await sql`SELECT * FROM reviews WHERE worker_id = ${id} ORDER BY created_at DESC`;
            return res.json({ ...workerResult[0], reviews });
        }

        if (workerMatch && method === 'PATCH') {
            const id = workerMatch[1];
            const { status, is_active } = req.body;
            const updated = await sql`
                UPDATE workers SET
                    status = COALESCE(${status}, status),
                    is_active = COALESCE(${is_active}, is_active)
                WHERE id = ${id} RETURNING *
            `;
            return res.json(updated[0]);
        }

        // ---- REVIEWS ----
        if (url === '/api/reviews' && method === 'POST') {
            const { worker_id, name, rating, comment, date } = req.body;
            const result = await sql`
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
            return res.status(201).json(result[0]);
        }

        // ---- CONTACT ----
        if (url === '/api/contact' && method === 'POST') {
            const { worker_id, customer_name, customer_phone, customer_email, message } = req.body;
            const result = await sql`
                INSERT INTO contact_requests (worker_id, customer_name, customer_phone, customer_email, message)
                VALUES (${worker_id}, ${customer_name}, ${customer_phone}, ${customer_email}, ${message})
                RETURNING *
            `;
            return res.status(201).json(result[0]);
        }

        // ---- AUTH ----
        if (url === '/api/auth/register' && method === 'POST') {
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

        if (url === '/api/auth/login' && method === 'POST') {
            const { email, password } = req.body;
            const users = await sql`SELECT * FROM users WHERE email = ${email}`;
            if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
            const valid = await bcrypt.compare(password, users[0].password_hash);
            if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
            const user = users[0];
            return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: generateToken(user) });
        }

        if (url === '/api/auth/me' && method === 'GET') {
            const user = getUser(req);
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ user });
        }

        // Google OAuth redirect
        if (url === '/api/auth/google') {
            const role = query.role || 'seeker';
            const callbackUrl = process.env.CALLBACK_URL;
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const state = encodeURIComponent(JSON.stringify({ role }));
            const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl!)}&response_type=code&scope=profile%20email&state=${state}`;
            return res.redirect(302, googleUrl);
        }

        // ---- SEEKER ----
        if (url === '/api/seeker/posts' && method === 'POST') {
            const user = getUser(req);
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const { title, description, category_id, province, city, budget } = req.body;
            const post = await sql`
                INSERT INTO seeker_posts (user_id, title, description, category_id, province, city, budget)
                VALUES (${user.id}, ${title}, ${description}, ${category_id}, ${province}, ${city}, ${budget})
                RETURNING *
            `;
            return res.status(201).json(post[0]);
        }

        if (url === '/api/seeker/posts' && method === 'GET') {
            const user = getUser(req);
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const posts = await sql`
                SELECT p.*, c.name as category_name FROM seeker_posts p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.user_id = ${user.id} ORDER BY p.created_at DESC
            `;
            return res.json(posts);
        }

        // ---- PROVIDER ----
        if (url === '/api/provider/posts' && method === 'GET') {
            const posts = await sql`
                SELECT p.*, u.name as seeker_name, c.name as category_name
                FROM seeker_posts p JOIN users u ON p.user_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.status = 'approved' AND p.is_active = TRUE ORDER BY p.created_at DESC
            `;
            return res.json(posts);
        }

        // ---- ADMIN ----
        if (url === '/api/admin/stats' && method === 'GET') {
            const user = getUser(req);
            if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
            const [users, workers, pending, posts] = await Promise.all([
                sql`SELECT COUNT(*) FROM users`,
                sql`SELECT COUNT(*) FROM workers`,
                sql`SELECT COUNT(*) FROM workers WHERE status = 'pending'`,
                sql`SELECT COUNT(*) FROM seeker_posts`
            ]);
            return res.json({ users: users[0].count, workers: workers[0].count, pendingWorkers: pending[0].count, posts: posts[0].count });
        }

        if (url === '/api/admin/workers' && method === 'GET') {
            const user = getUser(req);
            if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
            const workers = await sql`SELECT w.*, u.name as user_name, u.email as user_email FROM workers w LEFT JOIN users u ON w.user_id = u.id ORDER BY w.created_at DESC`;
            return res.json(workers);
        }

        if (url === '/api/admin/posts' && method === 'GET') {
            const user = getUser(req);
            if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
            const posts = await sql`SELECT p.*, u.name as user_name, c.name as category_name FROM seeker_posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC`;
            return res.json(posts);
        }

        return res.status(404).json({ error: 'Route not found', url });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
