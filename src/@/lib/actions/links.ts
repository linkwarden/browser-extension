import { bookmarkFormValues } from '../validators/bookmarkForm.ts';
import axios from 'axios';

async function captureFullPageScreenshot(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent((window) => {
      if (!window || !window.id) {
        reject(new Error("Unable to get the current window ID."));
        return;
      }

      chrome.tabs.captureVisibleTab(window.id, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!dataUrl) {
          reject(new Error("Failed to capture screenshot."));
          return;
        }

        fetch(dataUrl)
          .then((res) => res.blob())
          .then(resolve)
          .catch(reject);
      });
    });
  });
}


export async function postLink(baseUrl: string, uploadImage: boolean, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/v1/links`;

  if (uploadImage) {
    const link = await axios.post(url, data);
    const { id } = link.data.response;
    const archiveUrl = `${baseUrl}/api/v1/archives/${id}?format=0`;
    const screenshot = await captureFullPageScreenshot();

    const formData = new FormData();
    formData.append("file", screenshot, "screenshot.png");

    await axios.post(archiveUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return link;
  } else {
    return await axios.post(url, data);
  }
}

export async function postLinkFetch(baseUrl: string, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/v1/links`;

  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
  });
}

export async function updateLinkFetch(baseUrl: string, id: number, data: bookmarkFormValues) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
  });
}

export async function deleteLinkFetch(baseUrl: string, id: number) {
  const url = `${baseUrl}/api/v1/links/${id}`;

  return await fetch(url, {
    method: 'DELETE',
  });
}

export async function getLinksFetch(baseUrl: string) {
  const url = `${baseUrl}/api/v1/links`;
  const response = await fetch(url);
  return await response.json();
}