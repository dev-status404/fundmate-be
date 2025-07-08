interface ServiceConfig {
  name: string;
  swagger: string;
  port: number;
  url: string;
  base: string[];
}

const isDocker = process.env.NODE_ENV === 'docker';
const rowServiceConfig: Record<string, Omit<ServiceConfig, 'url'>> = {
  // jwt 확인
  'ai-service': {
    name: 'ai-service',
    swagger: 'ai.json',
    port: Number(process.env.AI_SERVICE_PORT) || 3001,
    base: ['/ai'],
  },
  // jwt 확인
  'auth-service': {
    name: 'auth-service',
    swagger: 'auths.json',
    port: Number(process.env.AUTH_SERVICE_PORT) || 3002,
    base: ['/auth', '/oauth'],
  },
  // jwt 확인
  // /projects post jwt 필
  // /projects get jwt x
  // /options jwt 확인
  // /api/projects jwt 확인만
  'funding-service': {
    name: 'funding-service',
    swagger: 'funding.json',
    port: Number(process.env.FUNDING_SERVICE_PORT) || 3003,
    base: ['/projects', '/options', '/api/projects'],
  },
  // jwt 필수
  'interaction-service': {
    name: 'interaction-service',
    swagger: 'interactions.json',
    port: Number(process.env.INTERACTION_SERVICE_PORT) || 3004,
    base: ['/interactions'],
  },
  // jwt 필수
  'payment-service': {
    name: 'payment-service',
    swagger: 'payment.json',
    port: Number(process.env.PAYMENT_SERVICE_PORT) || 3005,
    base: ['/payment'],
  },
  // jwt X
  'public-service': {
    name: 'public-service',
    swagger: 'public.json',
    port: Number(process.env.PUBLIC_SERVICE_PORT) || 3006,
    base: ['/public'],
  },
  // jwt 필요
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
    swagger: `/assets/${service.swagger}`,
    url: isDocker ? `http://${service.name}:${service.port}` : `http://localhost:${service.port}`,
  };
  return acc;
}, {} as Record<string, ServiceConfig>);
