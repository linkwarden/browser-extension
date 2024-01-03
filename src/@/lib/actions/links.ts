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
      'Content-Type': 'application/json'
    },
  });
}