import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url || '';

    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Route: GET /api/categories
        if (url === '/api/categories' || url === '/categories') {
            const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
            return res.status(200).json(categories);
        }

        // Route: GET /api/workers
        if (url.startsWith('/api/workers') || url.startsWith('/workers')) {
            const workers = await sql`SELECT * FROM workers ORDER BY created_at DESC`;
            return res.status(200).json(workers);
        }

        // Route: GET /api/health
        if (url === '/api/health' || url === '/health') {
            await sql`SELECT 1`;
            return res.status(200).json({ status: 'ok', database: 'connected' });
        }

        return res.status(404).json({ error: 'Route not found', url });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            url
        });
    }
}
