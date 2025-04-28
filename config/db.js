import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    statement_timeout: 5000
});

client.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch((error) => {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1);
    });

export default client;
