import client from './client';
import type { AuthResponse } from '@/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export const authApi = {
  login: (dto: LoginDto) =>
    client.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    client.post<AuthResponse>('/auth/register', dto).then((r) => r.data),
};
