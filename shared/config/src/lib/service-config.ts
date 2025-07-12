export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL';

export interface JwtRule {
  method: HTTPMethod;
  path: string;
  required: boolean;
}

export interface ServiceConfig {
  name: string;
  swagger: string;
  host: string;
  port: number;
  url: string;
  base: string[];
  jwtRules: JwtRule[];
}

const isDocker = process.env.NODE_ENV === 'docker';
const rowServiceConfig: Record<string, Omit<ServiceConfig, 'url' | 'host'>> = {
  'ai-service': {
    name: 'ai-service',
    swagger: 'ai.json',
    port: Number(process.env.AI_SERVICE_PORT) || 3001,
    base: ['/ai'],
    jwtRules: [
      { method: 'POST', path: '/ai/summarize', required: false },
      { method: 'POST', path: '/ai/requests', required: false },
    ],
  },
  'auth-service': {
    name: 'auth-service',
    swagger: 'auths.json',
    port: Number(process.env.AUTH_SERVICE_PORT) || 3002,
    base: ['/auth', '/oauth'],
    jwtRules: [
      { method: 'POST', path: '/auth/signup', required: false },
      { method: 'POST', path: '/auth/login', required: false },
      { method: 'POST', path: '/auth/token', required: true },
      { method: 'POST', path: '/auth/logout', required: true },
      { method: 'ALL', path: '/oauth', required: false },
    ],
  },
  'funding-service': {
    name: 'funding-service',
    swagger: 'funding.json',
    port: Number(process.env.FUNDING_SERVICE_PORT) || 3003,
    base: ['/projects', '/options', '/api/projects'],
    jwtRules: [
      { method: 'GET', path: '/project/:id', required: false },
      { method: 'GET', path: '/project/recent-completed', required: true },
      { method: 'GET', path: '/project/my-projects', required: true },
      { method: 'GET', path: '/project/comments', required: true },
      { method: 'POST', path: '/projects', required: true },
      { method: 'POST', path: '/options', required: true },
      { method: 'ALL', path: '/api/projects', required: false },
    ],
  },
  'interaction-service': {
    name: 'interaction-service',
    swagger: 'interactions.json',
    port: Number(process.env.INTERACTION_SERVICE_PORT) || 3004,
    base: ['/interactions'],
    jwtRules: [{ method: 'ALL', path: '/interactions', required: true }],
  },
  'payment-service': {
    name: 'payment-service',
    swagger: 'payment.json',
    port: Number(process.env.PAYMENT_SERVICE_PORT) || 3005,
    base: ['/payments', '/reservations', '/payment-methods'],
    jwtRules: [
      { method: 'ALL', path: '/payments', required: true },
      { method: 'ALL', path: '/reservations', required: true },
      { method: 'ALL', path: '/payment-methods', required: true },
    ],
  },
  'public-service': {
    name: 'public-service',
    swagger: 'public.json',
    port: Number(process.env.PUBLIC_SERVICE_PORT) || 3006,
    base: ['/public'],
    jwtRules: [{ method: 'ALL', path: '/public', required: false }],
  },
  'user-service': {
    name: 'user-service',
    swagger: 'users.json',
    port: Number(process.env.USER_SERVICE_PORT) || 3007,
    base: ['/users'],
    jwtRules: [{ method: 'ALL', path: '/users', required: true }],
  },
};

export const serviceConfig: Record<string, ServiceConfig> = Object.values(rowServiceConfig).reduce((acc, service) => {
  const host = isDocker ? service.name : 'localhost';
  acc[service.name] = {
    ...service,
    swagger: `/assets/${service.swagger}`,
    host,
    url: `http://${host}:${service.port}`,
  };
  return acc;
}, {} as Record<string, ServiceConfig>);
