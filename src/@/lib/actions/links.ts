import captureScreenshot from '../screenshot.ts';
// import captureFirefox from '../screenshot/firefox.ts';
import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';
import { bookmarkMetadata } from '../cache.ts';

export async function postLink(
  baseUrl: string,
  uploadImage: boolean,
  data: bookmarkFormValues,
  setState: (state: 'capturing' | 'uploading' | null) => void,
  apiKey: string
) {
  const url = `${baseUrl}/api/v1/links`;

  if (uploadImage) {
    setState('capturing');
    const screenshot = await captureScreenshot();
    setState('uploading');

    const link = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    
    const { id } = link.data.response;
    const archiveUrl = `${baseUrl}/api/v1/archives/${id}?format=0`;

    const formData = new FormData();
    formData.append('file', screenshot, 'screenshot.png');

    await axios.post(archiveUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return link;
  } else {
    return await axios.post(url, data);
  }
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
