import { getCurrentTabInfo, getStorageItem, setStorageItem, TabInfo } from './utils.ts';

const TAB_METADATA_KEY = 'lw_tab_metadata_cache';

export async function loadTabData() {
  //const config = await getConfig();
  //const api = new LinkwardenApi(config.baseUrl, config.apiToken);
  const metadata = await getCachedTabMetadata();
  const tab = await getCurrentTabInfo();
  //const link = await api.getLinkByUrl(tab.url);
  return { metadata, tab };
}

export async function getCachedTabMetadata() {
  const cache = await getStorageItem(TAB_METADATA_KEY);
  return cache ? JSON.parse(cache) : {};
}

export async function setCachedTabMetadata(metadata: TabInfo) {
  return await setStorageItem(TAB_METADATA_KEY, JSON.stringify(metadata));
}

export async function clearCachedTabMetadata() {
  return await setStorageItem(TAB_METADATA_KEY, JSON.stringify({}));
}