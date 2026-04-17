import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { worker_id, name, rating, comment, date } = req.body;
    if (!worker_id || !rating) return res.status(400).json({ error: 'Worker ID and Rating are required' });

    try {
        const sql = neon(process.env.DATABASE_URL!);

        // Insert review
        const result = await sql`
            INSERT INTO reviews (worker_id, name, rating, comment, date)
            VALUES (${worker_id}, ${name}, ${rating}, ${comment}, ${date})
            RETURNING *
        `;

        // Update worker aggregate rating
        await sql`
            UPDATE workers SET
                rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = ${worker_id}),
                reviews_count = (SELECT COUNT(*) FROM reviews WHERE worker_id = ${worker_id})
            WHERE id = ${worker_id}
        `;

        return res.status(201).json(result[0]);
    } catch (error: any) {
        console.error('Reviews API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
