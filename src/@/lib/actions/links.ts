import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';

export async function postLink(baseUrl: string, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/links`;

  return await axios.post(url, data);
}
