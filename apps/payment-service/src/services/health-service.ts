export interface HealthInfo {
  status: 'ok' | 'error';
  service: string;
  timestamp: number;
}

export function getHealthInfo(): HealthInfo {
  return {
    status: 'ok',
    service: 'payment-service',
    timestamp: Date.now(),
  };
}
