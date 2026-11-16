export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}
