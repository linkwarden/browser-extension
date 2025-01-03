import axios from 'axios';

interface ResponseCollections {
  color: string;
  createdAt: string;
  description: string;
  id: number;
  isPublic: boolean;
  members: never[]; // Assuming members can be of any type, adjust as necessary
  name: string;
  ownerId: number;
  parent: null | never; // Assuming parent can be of any type or null, adjust as necessary
  parentId: null | number; // Assuming parentId can be null or a number
  updatedAt: string;
}

export async function getCollections(baseUrl: string, apiKey: string) {
  const url = `${baseUrl}/api/v1/collections`;

  return await axios.get<{ response: ResponseCollections[] }>(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
