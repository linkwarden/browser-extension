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

interface CreateTagData {
  name: string;
}

export async function createTag(baseUrl: string, apiKey: string, tagData: CreateTagData) {
  const url = `${baseUrl}/api/v1/tags`;
  const response = await axios.post<{ response: ResponseTags }>(url, tagData, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data.response;
}

export async function getTags(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/tags`;
  return await axios.get<{ response: ResponseTags[] }>(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
