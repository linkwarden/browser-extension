import axios from 'axios';

export async function getTags(baseUrl: string) {
  const url = `${baseUrl}/api/v1/tags`;
  return await axios.get(url);
}
