import { neon } from '@neondatabase/serverless';

// Export a proxy that initializes the neon client on first use
// This ensures process.env.DATABASE_URL is available when the client is created.
const sqlProxy = new Proxy(() => { }, {
    get: (target, prop, receiver) => {
        const client = neon(process.env.DATABASE_URL || '');
        return (client as any)[prop];
    },
    apply: (target, thisArg, argumentsList) => {
        const client = neon(process.env.DATABASE_URL || '');
        return (client as any)(...argumentsList);
    }
});

export default sqlProxy as ReturnType<typeof neon>;
