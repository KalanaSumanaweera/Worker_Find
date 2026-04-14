import sql from './db';

async function migrate() {
    console.log('--- Starting Platform Migration (Phase 1) ---');

    try {
        // 1. Create Users Table
        console.log('Creating users table...');
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                google_id VARCHAR(255),
                role VARCHAR(20) DEFAULT 'seeker', -- seeker, provider, admin
                status VARCHAR(20) DEFAULT 'active', -- active, inactive, banned
                avatar_url TEXT,
                phone VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // 2. Modify Workers Table
        console.log('Modifying workers table...');
        // Add user_id if it doesn't exist
        await sql`ALTER TABLE workers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`;
        await sql`ALTER TABLE workers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved'`; // Existing workers are auto-approved for migration
        await sql`ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;

        // 3. Create Seeker Posts Table
        console.log('Creating seeker_posts table...');
        await sql`
            CREATE TABLE IF NOT EXISTS seeker_posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category_id INTEGER REFERENCES categories(id),
                province VARCHAR(100) NOT NULL,
                city VARCHAR(100) NOT NULL,
                budget INTEGER,
                status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // 4. Create Post Responses Table
        console.log('Creating post_responses table...');
        await sql`
            CREATE TABLE IF NOT EXISTS post_responses (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES seeker_posts(id) ON DELETE CASCADE,
                worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log('--- Migration Successful ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
