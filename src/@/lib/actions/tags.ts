import axios from 'axios';

interface ResponseTags {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    links: number;
  };
}

export async function getTags(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/tags`;
  return await axios.get<{ response: ResponseTags[] }>(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
