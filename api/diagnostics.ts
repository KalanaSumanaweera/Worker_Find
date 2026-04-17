import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
    const dbUrl = process.env.DATABASE_URL;
    let dbStatus = 'missing';
    let dbError: any = null;

    if (dbUrl) {
        try {
            const sql = neon(dbUrl);
            await sql`SELECT 1`;
            dbStatus = 'connected';
        } catch (err: any) {
            dbStatus = 'connection-failed';
            dbError = err.message || err;
        }
    }

    const mask = (str: string | undefined) => {
        if (!str) return 'missing';
        if (str.length < 10) return 'too-short';
        return `${str.substring(0, 5)}...${str.substring(str.length - 5)}`;
    };

    res.status(200).json({
        diagnostics: 'v2',
        database_status: dbStatus,
        db_error: dbError,
        env_check: {
            DATABASE_URL: mask(dbUrl),
            GOOGLE_CLIENT_ID: mask(process.env.GOOGLE_CLIENT_ID),
            CALLBACK_URL: process.env.CALLBACK_URL || 'missing',
            CLIENT_URL: process.env.CLIENT_URL || 'missing'
        },
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV || 'not-detected',
        current_time: new Date().toISOString()
    });
}
