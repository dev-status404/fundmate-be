import axios from 'axios';
import { ServiceConfig, serviceConfig } from '@shared/config';

export interface HealthResult {
  name: string;
  status: 'ok' | 'error' | 'down';
  latency?: number;
  error?: string;
}

export async function checkAllServices(): Promise<HealthResult[]> {
  const entries: { name: string; url: string }[] = Object.values(serviceConfig).map((svc: ServiceConfig) => ({
    name: svc.name,
    url: `${svc.url}/health`,
  }));

  return Promise.all(
    entries.map(async ({ name, url }) => {
      try {
        const start = Date.now();
        const resp = await axios.get(url, { timeout: 5000 });
        return {
          name,
          status: resp.status === 200 ? 'ok' : 'error',
          latency: Date.now() - start,
        } as HealthResult;
      } catch (err) {
        return {
          name,
          status: 'down',
          error: err instanceof Error ? err.stack || err.message : String(err),
        } as HealthResult;
      }
    })
  );
}
