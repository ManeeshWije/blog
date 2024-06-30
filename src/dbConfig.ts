import { Pool } from 'pg';
import { env } from 'bun';

export default new Pool ({
    max: 20,
    connectionString: env.DATABASE_URL,
    idleTimeoutMillis: 30000
});
