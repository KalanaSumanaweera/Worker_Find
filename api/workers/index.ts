import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q, category, province, district, rating } = req.query;
    const sql = neon(process.env.DATABASE_URL!);

    try {
        if (req.method === 'GET') {
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

        return res.status(405).end();
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
