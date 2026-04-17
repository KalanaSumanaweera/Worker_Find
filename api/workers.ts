import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { q, category } = req.query;

        let workers;
        if (!q && !category) {
            // Simplest query - identical to categories logic
            workers = await sql`SELECT * FROM workers ORDER BY created_at DESC`;
        } else {
            // Minimal filtering with fallback
            workers = await sql`
                SELECT w.* FROM workers w 
                WHERE (w.name ILIKE ${'%' + (q || '') + '%'} OR w.job ILIKE ${'%' + (q || '') + '%'})
                ORDER BY w.created_at DESC
            `;
        }

        return res.json(workers);
    } catch (error: any) {
        console.error('Worker API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
