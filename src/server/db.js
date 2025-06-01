import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = 'postgresql://medusa-db_owner:npg_RvF6KaEs2TNG@ep-empty-sky-a4kcpwt6-pooler.us-east-1.aws.neon.tech/medusa-db?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

export default pool;