export interface ServiceConfig {
  name: string;
  swagger: string;
  port: number;
  url: string;
  base: string[];
}

const isDocker = process.env.NODE_ENV === 'docker';
const rowServiceConfig: Record<string, Omit<ServiceConfig, 'url'>> = {
  'ai-service': {
    name: 'ai-service',
    swagger: 'ai.json',
    port: Number(process.env.AI_SERVICE_PORT) || 3001,
    base: ['/ai'],
  },
  'auth-service': {
    name: 'auth-service',
    swagger: 'auths.json',
    port: Number(process.env.AUTH_SERVICE_PORT) || 3002,
    base: ['/auth'],
  },
  'funding-service': {
    name: 'funding-service',
    swagger: 'funding.json',
    port: Number(process.env.FUNDING_SERVICE_PORT) || 3003,
    base: ['/funding'],
  },
  'interaction-service': {
    name: 'interaction-service',
    swagger: 'interactions.json',
    port: Number(process.env.INTERACTION_SERVICE_PORT) || 3004,
    base: ['/interactions'],
  },
  'payment-service': {
    name: 'payment-service',
    swagger: 'payment.json',
    port: Number(process.env.PAYMENT_SERVICE_PORT) || 3005,
    base: ['/payments'],
  },
  'public-service': {
    name: 'public-service',
    swagger: 'public.json',
    port: Number(process.env.PUBLIC_SERVICE_PORT) || 3006,
    base: ['/public'],
  },
  'user-service': {
    name: 'user-service',
    swagger: 'users.json',
    port: Number(process.env.USER_SERVICE_PORT) || 3007,
    base: ['/users'],
  },
};

export const serviceConfig: Record<string, ServiceConfig> = Object.values(rowServiceConfig).reduce((acc, service) => {
  acc[service.name] = {
    ...service,
    swagger: `/docs/assets/${service.swagger}`,
    url: isDocker ? `http://${service.name}:${service.port}` : `http://localhost:${service.port}`,
  };
  return acc;
}, {} as Record<string, ServiceConfig>);
