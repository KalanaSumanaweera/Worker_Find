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

    res.status(200).json({
        diagnostics: 'v1',
        database_url_present: !!dbUrl,
        database_status: dbStatus,
        db_error: dbError,
        google_id_present: !!process.env.GOOGLE_CLIENT_ID,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV
    });
}
