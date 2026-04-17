import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { worker_id, customer_name, customer_phone, customer_email, message } = req.body;
    if (!worker_id || (!customer_phone && !customer_email)) {
        return res.status(400).json({ error: 'Worker ID and contact info required' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL!);
        const result = await sql`
            INSERT INTO contact_requests (worker_id, customer_name, customer_phone, customer_email, message)
            VALUES (${worker_id}, ${customer_name}, ${customer_phone}, ${customer_email}, ${message})
            RETURNING *
        `;
        return res.status(201).json(result[0]);
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
