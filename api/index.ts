import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();

// --- STARTUP VALIDATION ---
const requiredEnv = [
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CALLBACK_URL',
    'CLIENT_URL',
    'JWT_SECRET'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error('CRITICAL: Missing required environment variables:', missingEnv.join(', '));
}

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- GOOGLE OAUTH CONFIG ---

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    passReqToCallback: true
}, async (req: any, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error('No email found from Google profile'));

        // Check if user exists
        let userResult = await sql`SELECT * FROM users WHERE email = ${email} OR google_id = ${profile.id}`;
        let user;

        if (userResult.length === 0) {
            // Get role from state
            const stateParams = req.query.state ? JSON.parse(req.query.state as string) : {};
            const role = stateParams.role || 'seeker';

            // Create new user
            const newUser = await sql`
                INSERT INTO users (name, email, google_id, role, avatar_url)
                VALUES (${profile.displayName}, ${email}, ${profile.id}, ${role}, ${profile.photos?.[0].value})
                RETURNING *
            `;
            user = newUser[0];
        } else {
            user = userResult[0];
            // Update google_id if it wasn't there
            if (!user.google_id) {
                await sql`UPDATE users SET google_id = ${profile.id} WHERE id = ${user.id}`;
            }
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// --- AUTH ROUTES ---

// Google Auth
app.get('/api/auth/google', (req, res, next) => {
    const role = req.query.role || 'seeker';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ role }) // Pass role in state
    })(req, res, next);
});

app.get('/api/auth/google/callback', passport.authenticate('google', { session: false }), (req: any, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userJson = encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }));

    // Redirect back to frontend with token and user data
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}&user=${userJson}`);
});

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await sql`
            INSERT INTO users (name, email, password_hash, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${role || 'seeker'})
            RETURNING id, name, email, role
        `;

        const token = generateToken(newUser[0] as any);
        res.status(201).json({ user: newUser[0], token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user as any);
        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken as any, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

// Health check/Diagnostics
app.get('/api/health', async (req, res) => {
    let dbStatus = 'missing';
    let dbError = null;

    if (process.env.DATABASE_URL) {
        try {
            await sql`SELECT 1`;
            dbStatus = 'connected';
        } catch (err: any) {
            dbStatus = 'connection-failed';
            dbError = err.message;
        }
    }

    res.json({
        status: 'ok',
        database: dbStatus,
        dbError,
        googleAuth: (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? 'configured' : 'missing',
        callbackUrl: process.env.CALLBACK_URL || 'missing',
        clientUrl: process.env.CLIENT_URL || 'missing',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'not-detected'
    });
});

// --- ADMIN ROUTES ---

// Admin Stats
app.get('/api/admin/stats', authenticateToken as any, authorizeRoles('admin') as any, async (req, res) => {
    try {
        const usersCount = await sql`SELECT COUNT(*) FROM users`;
        const workersCount = await sql`SELECT COUNT(*) FROM workers`;
        const pendingWorkers = await sql`SELECT COUNT(*) FROM workers WHERE status = 'pending'`;
        const postsCount = await sql`SELECT COUNT(*) FROM seeker_posts`;
        const pendingPosts = await sql`SELECT COUNT(*) FROM seeker_posts WHERE status = 'pending'`;
        const leadsCount = await sql`SELECT COUNT(*) FROM contact_requests`;

        res.json({
            users: usersCount[0].count,
            workers: workersCount[0].count,
            pendingWorkers: pendingWorkers[0].count,
            posts: postsCount[0].count,
            pendingPosts: pendingPosts[0].count,
            leads: leadsCount[0].count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Admin Manage Workers
app.get('/api/admin/workers', authenticateToken as any, authorizeRoles('admin') as any, async (req, res) => {
    try {
        const workers = await sql`
            SELECT w.*, u.name as user_name, u.email as user_email 
            FROM workers w
            LEFT JOIN users u ON w.user_id = u.id
            ORDER BY w.created_at DESC
        `;
        res.json(workers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
});

app.patch('/api/admin/workers/:id', authenticateToken as any, authorizeRoles('admin') as any, async (req, res) => {
    const { id } = req.params;
    const { status, is_active } = req.body;

    try {
        const updated = await sql`
            UPDATE workers 
            SET 
                status = COALESCE(${status}, status),
                is_active = COALESCE(${is_active}, is_active)
            WHERE id = ${id}
            RETURNING *
        `;
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

// Admin Manage Seeker Posts
app.get('/api/admin/posts', authenticateToken as any, authorizeRoles('admin') as any, async (req, res) => {
    try {
        const posts = await sql`
            SELECT p.*, u.name as user_name, c.name as category_name
            FROM seeker_posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `;
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.patch('/api/admin/posts/:id', authenticateToken as any, authorizeRoles('admin') as any, async (req, res) => {
    const { id } = req.params;
    const { status, is_active } = req.body;

    try {
        const updated = await sql`
            UPDATE seeker_posts 
            SET 
                status = COALESCE(${status}, status),
                is_active = COALESCE(${is_active}, is_active)
            WHERE id = ${id}
            RETURNING *
        `;
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// --- SEEKER ROUTES ---

// Create a job post
app.post('/api/seeker/posts', authenticateToken as any, authorizeRoles('seeker') as any, async (req: AuthRequest, res) => {
    const { title, description, category_id, province, city, budget } = req.body;
    const user_id = req.user?.id;

    try {
        const newPost = await sql`
            INSERT INTO seeker_posts (user_id, title, description, category_id, province, city, budget)
            VALUES (${user_id}, ${title}, ${description}, ${category_id}, ${province}, ${city}, ${budget})
            RETURNING *
        `;
        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get own posts with responses
app.get('/api/seeker/posts', authenticateToken as any, authorizeRoles('seeker') as any, async (req: AuthRequest, res) => {
    const user_id = req.user?.id;

    try {
        const posts = await sql`
            SELECT p.*, c.name as category_name,
            (SELECT json_agg(r) FROM (
                SELECT pr.*, w.name as worker_name, w.job as worker_job 
                FROM post_responses pr
                JOIN workers w ON pr.worker_id = w.id
                WHERE pr.post_id = p.id
            ) r) as responses
            FROM seeker_posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = ${user_id}
            ORDER BY p.created_at DESC
        `;
        res.json(posts);
    } catch (error) {
        console.error('Error fetching seeker posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// --- PROVIDER ROUTES ---

// Get available approved job posts
app.get('/api/provider/posts', authenticateToken as any, authorizeRoles('provider') as any, async (req, res) => {
    try {
        const posts = await sql`
            SELECT p.*, u.name as seeker_name, c.name as category_name
            FROM seeker_posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'approved' AND p.is_active = TRUE
            ORDER BY p.created_at DESC
        `;
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Respond to a post
app.post('/api/provider/posts/:id/respond', authenticateToken as any, authorizeRoles('provider') as any, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const user_id = req.user?.id;

    try {
        // Find worker profile for this user
        const workers = await sql`SELECT id FROM workers WHERE user_id = ${user_id}`;
        if (workers.length === 0) {
            return res.status(403).json({ error: 'Worker profile not found' });
        }

        const newResponse = await sql`
            INSERT INTO post_responses (post_id, worker_id, message)
            VALUES (${id}, ${workers[0].id}, ${message})
            RETURNING *
        `;
        res.status(201).json(newResponse[0]);
    } catch (error) {
        console.error('Error responding to post:', error);
        res.status(500).json({ error: 'Failed to send response' });
    }
});

// Get/Update provider profile
app.get('/api/provider/profile', authenticateToken as any, authorizeRoles('provider') as any, async (req: AuthRequest, res) => {
    try {
        const profile = await sql`SELECT * FROM workers WHERE user_id = ${req.user?.id}`;
        res.json(profile[0] || null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// --- EXISTING ROUTES ---

// 1. Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
        res.json(categories);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            error: 'Failed to fetch categories',
            message: error.message,
            stack: error.stack
        });
    }
});

// 2. Get all workers with relational filtering
app.get('/api/workers', async (req, res) => {
    const { q, category, province, district, rating } = req.query;

    try {
        let queryStr = `
      SELECT DISTINCT w.* 
      FROM workers w
      LEFT JOIN worker_categories wc ON w.id = wc.worker_id
      LEFT JOIN categories c ON wc.category_id = c.id
      WHERE 1=1
    `;

        if (q) queryStr += ` AND (w.name ILIKE '%${q}%' OR w.job ILIKE '%${q}%' OR c.name ILIKE '%${q}%')`;
        if (category) {
            // Find category by name or slug
            queryStr += ` AND (c.name ILIKE '%${category}%' OR c.slug = '${category}')`;
        }
        if (province) queryStr += ` AND w.province = '${province}'`;
        if (district) queryStr += ` AND w.city ILIKE '%${district}%'`;
        if (rating) queryStr += ` AND w.rating >= ${rating}`;

        queryStr += ' ORDER BY w.created_at DESC';

        const workers = await sql.unsafe(queryStr);
        res.json(workers);
    } catch (error: any) {
        console.error('Error fetching workers:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

// 3. Get single worker and their reviews
app.get('/api/workers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const workerResult = await sql`SELECT * FROM workers WHERE id = ${id}`;
        if (workerResult.length === 0) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        const reviews = await sql`SELECT * FROM reviews WHERE worker_id = ${id} ORDER BY created_at DESC`;

        res.json({
            ...workerResult[0],
            reviews
        });
    } catch (error) {
        console.error('Error fetching worker detail:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Submit Contact Request (Lead)
app.post('/api/contact', async (req, res) => {
    const { worker_id, customer_name, customer_phone, customer_email, message } = req.body;

    try {
        const result = await sql`
      INSERT INTO contact_requests (worker_id, customer_name, customer_phone, customer_email, message)
      VALUES (${worker_id}, ${customer_name}, ${customer_phone}, ${customer_email}, ${message})
      RETURNING *
    `;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error submitting contact request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Add a worker (Admin) - Extended to handle multiple category links
app.post('/api/workers', async (req, res) => {
    const { name, job, price, province, city, story, services, image_url, category_ids } = req.body;

    try {
        const result = await sql`
      INSERT INTO workers (name, job, price, province, city, story, services, image_url) 
      VALUES (${name}, ${job}, ${price}, ${province}, ${city}, ${story}, ${services}, ${image_url}) 
      RETURNING *
    `;

        if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
            for (const catId of category_ids) {
                await sql`
          INSERT INTO worker_categories (worker_id, category_id)
          VALUES (${result[0].id}, ${catId})
        `;
            }
        }

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error adding worker:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. Add a review
app.post('/api/reviews', async (req, res) => {
    const { worker_id, name, rating, comment, date } = req.body;

    try {
        const result = await sql`
      INSERT INTO reviews (worker_id, name, rating, comment, date) 
      VALUES (${worker_id}, ${name}, ${rating}, ${comment}, ${date}) 
      RETURNING *
    `;

        // Update worker's average rating and count
        await sql`
      UPDATE workers 
      SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = ${worker_id}),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE worker_id = ${worker_id})
      WHERE id = ${worker_id}
    `;

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        error: 'Global Server Error',
        message: err.message,
        stack: err.stack
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;
