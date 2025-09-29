import captureScreenshot from '../screenshot.ts';
import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';
import { bookmarkMetadata } from '../cache.ts';
import { getCurrentTabInfo } from '../utils.ts';

export async function postLink(
  baseUrl: string,
  uploadImage: boolean,
  data: bookmarkFormValues,
  setState: (state: 'capturing' | 'uploading' | null) => void,
  apiKey: string
) {
  console.log('🔗 PostLink called with data:', data);
  const url = `${baseUrl}/api/v1/links`;

  // Ensure tags is always an array and format correctly for API
  // API expects full tag objects with {id, name}, not just IDs
  const formattedTags = (data.tags || [])
    .filter(tag => tag && (tag.id || tag.name)) // Ensure tag has either ID or name
    .map(tag => ({
      id: tag.id,
      name: tag.name
    }));

  const formattedData = {
    ...data,
    tags: formattedTags, // Send full tag objects as API expects
    collection: data.collection?.id ? { id: data.collection.id } : data.collection, // Handle collection ID
  };

  // Debug logging
  console.log('🔍 Original tags data:', data.tags);
  console.log('🔍 Tags validation:', data.tags?.map(tag => ({ name: tag.name, id: tag.id, hasId: !!tag.id, hasName: !!tag.name })));
  console.log('🔍 Formatted tags data (full objects):', formattedData.tags);
  console.log('🔍 Sending data to API:', JSON.stringify(formattedData, null, 2));

  // Temporary alert for debugging (remove after testing)
  if (formattedData.tags && formattedData.tags.length > 0) {
    console.warn('⚠️ ALERT: About to send tags:', formattedData.tags.map(t => `${t.name}(${t.id})`).join(', '));
  }

  if (uploadImage) {
    setState('capturing');
    const screenshot = await captureScreenshot();
    setState('uploading');

    const link = await axios.post(url, formattedData, {
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

    setState(null);

    return link;
  } else {
    return await axios.post(url, formattedData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }
}

export async function postLinkFetch(
  baseUrl: string,
  data: bookmarkFormValues,
  apiKey: string
) {
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

export async function updateLinkFetch(
  baseUrl: string,
  id: number,
  data: bookmarkFormValues,
  apiKey: string
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

export async function deleteLinkFetch(
  baseUrl: string,
  id: number,
  apiKey: string
) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function getLinksFetch(
  baseUrl: string,
  apiKey: string
): Promise<{ response: bookmarkMetadata[] }> {
  const url = `${baseUrl}/api/v1/links`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return await response.json();
}

export async function checkLinkExists(
  baseUrl: string,
  apiKey: string
): Promise<boolean> {
  const tabInfo = await getCurrentTabInfo();
  if (!tabInfo.url) {
    console.error('No URL found for current tab');
    return false;
  }

  const url =
    `${baseUrl}/api/v1/links?cursor=0&sort=0&searchQueryString=` +
    encodeURIComponent(`${tabInfo.url}`);

  console.log('Checking if link exists at:', url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();

  console.log('Link exists response:', data);

  const exists = data.response.length > 0;

  return exists;
}
