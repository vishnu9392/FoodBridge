import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env';

let isDbConnected = false;
let dbConnectionError: string | null = null;

// Fix for Windows c-ares SRV DNS resolution failure (querySrv ECONNREFUSED)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore fallback if restricted
  }
}

// Safe sanitizer: mask password from URI or error strings
export function sanitizeMongoUri(rawStr: string): string {
  if (!rawStr) return '';
  return rawStr.replace(/\/\/([^:]+):([^@]+)@/g, '//$1:****@');
}

export function getDatabaseStatus(): {
  connected: boolean;
  readyState: number;
  error: string | null;
  databaseName?: string;
} {
  return {
    connected: isDbConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    error: dbConnectionError ? sanitizeMongoUri(dbConnectionError) : null,
    databaseName: isDbConnected ? mongoose.connection.name : undefined,
  };
}

export async function connectDatabase(): Promise<boolean> {
  const rawUri = config.mongoUri.trim();

  if (!rawUri) {
    dbConnectionError = 'MONGODB_URI is not set in server/.env. Please configure your MongoDB Atlas connection string.';
    console.warn('⚠️ [MongoDB Warning]: MONGODB_URI is empty. Please set your connection string in server/.env');
    return false;
  }

  // Auto-clean: Remove accidental placeholder brackets around password <password> -> password
  let uri = rawUri.replace(/:<([^>]+)>@/, (_m, p) => `:${p}@`);

  // Auto-clean: If database path is missing, ensure /foodbridge is appended
  if (!uri.includes('/foodbridge')) {
    const questionIdx = uri.indexOf('?');
    if (questionIdx !== -1) {
      const base = uri.slice(0, questionIdx).replace(/\/$/, '');
      uri = `${base}/foodbridge${uri.slice(questionIdx)}`;
    } else {
      uri = uri.replace(/\/$/, '') + '/foodbridge?retryWrites=true&w=majority';
    }
  }

  try {
    // Disable command buffering: Fail fast if DB ever drops rather than hanging for 10000ms
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    console.log(`📡 [MongoDB Atlas]: Connecting to ${sanitizeMongoUri(uri)} ...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      dbName: 'foodbridge',
    });

    isDbConnected = true;
    dbConnectionError = null;
    console.log(`✅ [MongoDB Atlas]: Connected successfully to database: ${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      const safeMsg = sanitizeMongoUri(err.message);
      console.error('❌ [MongoDB Error]:', safeMsg);
      isDbConnected = false;
      dbConnectionError = safeMsg;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB Atlas]: Disconnected from database');
      isDbConnected = false;
    });

    return true;
  } catch (err: any) {
    const rawError = err?.message || 'Failed to connect to MongoDB Atlas';
    const safeError = sanitizeMongoUri(rawError);

    isDbConnected = false;
    dbConnectionError = safeError;
    console.error('❌ [MongoDB Atlas Connection Failure]:', safeError);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isDbConnected = false;
    console.log('MongoDB connection closed.');
  }
}
