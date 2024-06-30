import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';

export async function postLink(baseUrl: string, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/v1/links`;

  return await axios.post(url, data);
}

export async function postLinkFetch(baseUrl: string, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/v1/links`;

  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function updateLinkFetch(
  baseUrl: string,
  id: number,
  data: bookmarkFormValues
) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteLinkFetch(baseUrl: string, id: number) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'DELETE',
  });
}

export async function getLinksFetch(baseUrl: string) {
  const url = `${baseUrl}/api/v1/links`;
  const response = await fetch(url);
  return await response.json();
}

export async function getLinkFetch(baseUrl: string, linkUrl: string) {
  const url =
    `${baseUrl}/api/v1/links` +
    `?searchByUrl=true&searchQueryString=${linkUrl}`;
  const response = await fetch(url);
  return await response.json();
}
