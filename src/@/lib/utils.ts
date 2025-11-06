import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLinksFetch, checkLinkExists } from './actions/links.ts';
import { getConfig } from './config.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TabInfo {
  url: string;
  title: string;
}

export async function getCurrentTabInfo(): Promise<{
  id: number | undefined;
  title: string | undefined;
  url: string | undefined
}> {
  const tabs = await getBrowser().tabs.query({ active: true, currentWindow: true });
  const { id, url, title } = tabs[0];
  return { id, url, title };
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

export async function updateBadge(tabId: number | undefined) {
  if (!tabId) return;

  const cachedConfig = await getConfig();
  const linkExists = await checkLinkExists(
    cachedConfig.baseUrl,
    cachedConfig.apiKey
  );
  if (linkExists) {
    if (browser.action) {
      browser.action.setBadgeText({ tabId, text: '✓' });
      browser.action.setBadgeBackgroundColor({ tabId, color: '#4688F1' });
    } else {
      browser.browserAction.setBadgeText({ tabId, text: '✓' });
      browser.browserAction.setBadgeBackgroundColor({
        tabId,
        color: '#4688F1',
      });
    }
  } else {
    if (browser.action) {
      browser.action.setBadgeText({ tabId, text: '' });
    } else {
      browser.browserAction.setBadgeText({ tabId, text: '' });
    }
  }
}