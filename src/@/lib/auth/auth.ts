import axios from 'axios';

export interface DataLogin {
  username: string;
  password: string;
  redirect: boolean;
  csrfToken: string;
  callbackUrl: string;
  json: boolean;
}

export interface DataLogout {
  csrfToken: string;
  callbackUrl: string;
  json: boolean;
}

export async function getCsrfToken(url: string): Promise<string> {
  const token = await axios.get(`${url}/api/v1/auth/csrf`);
  const { csrfToken } = token.data;
  return csrfToken;

}

export async function performLoginOrLogout(url: string, data: DataLogin | DataLogout) {
  const formBody = Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return await axios.post(url, formBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function getSession(url: string) {
  const session = await axios.get(`${url}/api/v1/auth/session`);
  return session.data.user;
}
