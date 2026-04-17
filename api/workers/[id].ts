import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    const sql = neon(process.env.DATABASE_URL!);

    try {
        if (req.method === 'GET') {
            const workerResult = await sql`SELECT * FROM workers WHERE id = ${id}`;
            if (workerResult.length === 0) return res.status(404).json({ error: 'Worker not found' });
            const reviews = await sql`SELECT * FROM reviews WHERE worker_id = ${id} ORDER BY created_at DESC`;
            return res.json({ ...workerResult[0], reviews });
        }
        return res.status(405).end();
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
