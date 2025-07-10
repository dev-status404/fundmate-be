import axios, { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { ServiceConfig } from '@shared/config';

export async function proxyRequest(service: ServiceConfig, req: Request): Promise<{ status: number; data: any }> {
  if (!service) {
    throw new Error('proxyRequest: 올바른 ServiceConfig({ url: string })를 첫번째 인자로 넘겨주세요');
  }
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
