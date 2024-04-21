import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';
import { bookmarkMetadata } from '../cache.ts';

export async function postLink(baseUrl: string, data: bookmarkFormValues, apiKey: string) {
  const url = `${baseUrl}/api/v1/links`;

  return await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function postLinkFetch(baseUrl: string, data: bookmarkFormValues, apiKey: string) {
  const url = `${baseUrl}/api/v1/links`;

  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function updateLinkFetch(baseUrl: string, id: number, data: bookmarkFormValues, apiKey: string) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function deleteLinkFetch(baseUrl: string, id: number, apiKey: string) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function getLinksFetch(baseUrl: string, apiKey: string): Promise<{ response: bookmarkMetadata[] }> {
  const url = `${baseUrl}/api/v1/links`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return await response.json();
}
