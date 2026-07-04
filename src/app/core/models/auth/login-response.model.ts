export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
}
