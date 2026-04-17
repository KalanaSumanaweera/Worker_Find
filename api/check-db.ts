import sql from './db';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const cats = await sql`SELECT * FROM categories`;
    console.log(JSON.stringify(cats, null, 2));
    process.exit(0);
}
check();
