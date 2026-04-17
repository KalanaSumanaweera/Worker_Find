import { neon } from '@neondatabase/serverless';

// Export a proxy that initializes the neon client on first use
let clientInstance: any = null;
const getClient = () => {
    if (!clientInstance) clientInstance = neon(process.env.DATABASE_URL || '');
    return clientInstance;
};

const sqlProxy = new Proxy(() => { }, {
    get: (target, prop) => {
        return getClient()[prop];
    },
    apply: (target, thisArg, argumentsList) => {
        return getClient()(...argumentsList);
    }
});

export default sqlProxy as any;
