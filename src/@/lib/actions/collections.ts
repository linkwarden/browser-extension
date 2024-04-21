import axios from 'axios';

export async function getCollections(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/collections`;

  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
