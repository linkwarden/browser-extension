import axios from 'axios';

export async function getTags(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/tags`;
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
