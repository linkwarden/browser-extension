import axios from 'axios';

export async function getTags(baseUrl: string) {
  const url = `${baseUrl}/api/routes/tags`;
  return await axios.get(url);
}