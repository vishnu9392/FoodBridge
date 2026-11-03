import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Robust .env discovery across different process launch directories
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env'),
];

let loadedPath = '';
for (const candidate of candidateEnvPaths) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    loadedPath = candidate;
    break;
  }
}

if (!loadedPath) {
  dotenv.config();
}

export interface AppConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  clientOrigin: string;
  nodeEnv: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'foodbridge_default_jwt_secret_change_me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
