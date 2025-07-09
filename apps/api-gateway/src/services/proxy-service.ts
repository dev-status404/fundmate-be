import axios, { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { ServiceConfig } from '@shared/config';

export async function proxyRequest(service: ServiceConfig, req: Request): Promise<{ status: number; data: any }> {
  const targetUrl = `${service.url}${req.originalUrl}`;
  const config: AxiosRequestConfig = {
    method: req.method,
    url: targetUrl,
    headers: req.headers,
    data: req.body,
    params: req.query,
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
  };
  const resp = await axios(config);
  return { status: resp.status, data: resp.data };
}
