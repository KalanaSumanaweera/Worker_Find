import { neon } from '@neondatabase/serverless';

// Simple initialization for Vercel stability
// The @neondatabase/serverless driver handles connection pools automatically
const sql = neon(process.env.DATABASE_URL || '');

export default sql;
