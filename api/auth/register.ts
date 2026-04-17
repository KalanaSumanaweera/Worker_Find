import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user: any) =>
    jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { name, email, password, role } = req.body;

    try {
        const sql = neon(process.env.DATABASE_URL!);
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await sql`
            INSERT INTO users (name, email, password_hash, role)
            VALUES (${name}, ${email}, ${hashed}, ${role || 'seeker'})
            RETURNING id, name, email, role
        `;

        const user = newUser[0];
        const token = generateToken(user);

        return res.status(201).json({ user, token });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
