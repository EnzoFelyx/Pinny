import { defineConfig } from 'drizzle-kit';

// Gera as migrações a partir de src/db/schema.ts: npm run db:generate
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
});
