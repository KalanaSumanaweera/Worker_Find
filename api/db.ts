import { neon } from '@neondatabase/serverless';

const sqlProxy = new Proxy(() => { }, {
    get: (target, prop) => {
        return getClient()[prop];
    },
    apply: (target, thisArg, argumentsList) => {
        return getClient()(...argumentsList);
    }
});

export default sqlProxy as any;
