import path from 'node:path';

try {
  process.loadEnvFile(path.resolve(__dirname, '../../.env'));
} catch {
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa .env.example.`);
  }
  return value;
}

export interface Credentials {
  email: string;
  password: string;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:8080/api/v1',
  get user(): Credentials {
    return {
      email: required('E2E_USER_EMAIL'),
      password: required('E2E_USER_PASSWORD'),
    };
  },
};
