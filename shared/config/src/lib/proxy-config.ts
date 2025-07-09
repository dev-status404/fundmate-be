import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HTTPMethod, ServiceConfig } from '@shared/config';

export class ServiceClient {
  private readonly client: AxiosInstance;

  constructor(private readonly config: ServiceConfig) {
    this.client = axios.create({
      baseURL: config.url,
      timeout: 10_000,
      headers: {
        'Content-Type': 'application/json',
        // 여기에 공통 헤더(ex. 인증토큰 등)를 추가할 수도 있습니다.
      },
    });
  }

  public async request<T = any>(
    method: HTTPMethod,
    path: string,
    data?: any,
    params?: Record<string, any>,
    extraConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.normalizePath(path);
    return this.client.request<T>({
      method,
      url,
      data,
      params,
      ...extraConfig,
    });
  }

  public get<T = any>(path: string, params?: Record<string, any>) {
    return this.request<T>('GET', path, undefined, params);
  }

  public post<T = any>(path: string, data?: any) {
    return this.request<T>('POST', path, data);
  }

  public put<T = any>(path: string, data?: any) {
    return this.request<T>('PUT', path, data);
  }

  public patch<T = any>(path: string, data?: any) {
    return this.request<T>('PATCH', path, data);
  }

  public delete<T = any>(path: string) {
    return this.request<T>('DELETE', path);
  }

  /** path에 `/base` 중복이 들어오지 않도록 정리 */
  private normalizePath(path: string): string {
    // 예: path 가 '/projects/123' 이고 basePaths에 '/projects' 가 있으면
    // 이미 앞부분이 base라면 그대로, 아니라면 basePaths[0] + path
    const base = this.config.base.find((b) => path.startsWith(b));
    if (base) {
      // 이미 base를 포함하고 있을 때
      return path;
    }
    // 기본 basePaths[0] 사용
    return `${this.config.base[0]}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
