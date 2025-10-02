import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLinksFetch } from './actions/links.ts';
import { getConfig } from './config.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TabInfo {
  url: string;
  title: string;
  description?: string;
}

export async function getCurrentTabInfo(): Promise<{ title: string | undefined; url: string | undefined; description: string | undefined }> {
  const tabs = await getBrowser().tabs.query({ active: true, currentWindow: true });
  const { url, title } = tabs[0];

  let description: string | undefined;

  try {
    // Try to execute script to get meta description
    if (tabs[0].id) {
      // Type assertion to handle Chrome/Firefox API differences
      const browser = getBrowser() as any;

      const extractMetaDescription = () => {
        // Get meta description from the page
        const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (metaDescription) {
          return metaDescription.getAttribute('content');
        } else {
          // Fallback: try og:description
          const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
          if (ogDescription) {
            return ogDescription.getAttribute('content');
          } else {
            // Last fallback: try twitter:description
            const twitterDescription = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
            return twitterDescription ? twitterDescription.getAttribute('content') : null;
          }
        }
      };

      // Check if scripting API is available (Manifest V3 - Chromium)
      if (browser.scripting && browser.scripting.executeScript) {
        const results = await browser.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: extractMetaDescription
        });

        if (results && results[0] && results[0].result) {
          description = results[0].result;
        }
      }
      // Fallback to tabs.executeScript (Manifest V2 - Firefox)
      else if (browser.tabs && browser.tabs.executeScript) {
        const results = await browser.tabs.executeScript(tabs[0].id, {
          code: `(${extractMetaDescription.toString()})()`
        });

        if (results && results[0]) {
          description = results[0];
        }
      }
    }
  } catch (error) {
    // Silently fail if content script execution fails
    console.debug('Could not extract meta description:', error);
  }

  return { url, title, description };
}

export function getBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return typeof browser !== 'undefined' ? browser : chrome;
}

export function getChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage;
}

export async function getStorageItem(key: string) {
  if (getChromeStorage()) {
    const result = await getBrowser().storage.local.get([key]);
    return result[key];
  } else {
    return getBrowser().storage.local.get(key);
  }
}

export const checkDuplicatedItem = async () => {
  const config = await getConfig();
  const currentTab = await getCurrentTabInfo();
  const { response } = await getLinksFetch(config.baseUrl, config.apiKey);
  const formatLinks = response.map((link) => link.url);
  return formatLinks.includes(currentTab.url ?? '');
};

export async function setStorageItem(key: string, value: string) {
  if (getChromeStorage()) {
    return await chrome.storage.local.set({ [key]: value });
  } else {
    await getBrowser().storage.local.set({ [key]: value });
    return Promise.resolve();
  }
}

export function openOptions() {
  getBrowser().runtime.openOptionsPage();
}
