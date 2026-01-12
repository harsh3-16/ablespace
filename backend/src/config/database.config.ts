import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Support DATABASE_URL (Supabase/Heroku style) or individual vars
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse the URL
    const url = new URL(databaseUrl);
    return {
      type: 'postgres' as const,
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1), // Remove leading /
      ssl: url.searchParams.get('sslmode') !== 'disable' ? { rejectUnauthorized: false } : false,
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    };
  }

  // Fallback to individual environment variables
  return {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'product_explorer',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
  };
});
