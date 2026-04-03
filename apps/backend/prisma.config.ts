import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma configuration file.
 *
 * DATABASE_URL should follow the format:
 *   postgresql://USER:PASSWORD@HOST:PORT/DATABASE
 *
 * Set this in .env (see .env.example in the project root).
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Reads from .env via dotenv/config imported above
    url: process.env['DATABASE_URL'],
  },
});
