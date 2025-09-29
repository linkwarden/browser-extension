import axios from 'axios';

interface ResponseTag {
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

  // Linkwarden API expects tags in a specific format: { tags: [{ label: "name" }] }
  const requestBody = {
    tags: [
      {
        label: tagData.name.trim(),
      }
    ]
  };

  console.log('🏷️ Creating tag with request body:', JSON.stringify(requestBody, null, 2));

  const response = await axios.post<{ response: ResponseTag[] }>(url, requestBody, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  console.log('✅ Tag creation response:', response.data);

  // Return the first (and only) created tag
  return response.data.response[0];
}

export async function getTags(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/tags`;
  return await axios.get<{ response: ResponseTag[] }>(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
