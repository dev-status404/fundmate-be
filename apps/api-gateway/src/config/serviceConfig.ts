export interface ServiceConfig {
  name: string;
  basePath: string;
  target: string;
}

export const serviceConfig: ServiceConfig[] = [
  {
    name: 'auth-service',
    basePath: '/auths',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  },
  {
    name: 'user-service',
    basePath: '/users',
    target: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  },
  {
    name: 'public-service',
    basePath: '/public',
    target: process.env.PUBLIC_SERVICE_URL || 'http://localhost:3006',
  },
  {
    name: 'funding-service',
    basePath: '/fundings',
    target: process.env.FUNDING_SERVICE_URL || 'http://localhost:3003',
  },
  {
    name: 'ai-service',
    basePath: '/ai',
    target: process.env.AI_SERVICE_URL || 'http://localhost:3001',
  },
  {
    name: 'payment-service',
    basePath: '/payment',
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  },
  {
    name: 'interaction-service',
    basePath: '/interactions',
    target: process.env.INTERACTIONS_SERVICE_URL || 'http://localhost:3004',
  },
];
