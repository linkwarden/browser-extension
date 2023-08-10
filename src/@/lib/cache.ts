import { getStorageItem, setStorageItem } from './utils.ts';
import { DefaultConfig } from './config.ts';

const OPTIONS_METADATA_KEY = 'lw_options_metadata_cache';

// TODO: Implement caching for tabs metadata maybe?
export async function getCachedOptionsMetadata(): Promise<DefaultConfig> {
  const cache = await getStorageItem(OPTIONS_METADATA_KEY);
  return cache ? JSON.parse(cache) : {};
}

export async function setCachedOptionsMetadata(metadata: DefaultConfig) {
  return await setStorageItem(OPTIONS_METADATA_KEY, JSON.stringify(metadata));
}

export async function clearCachedOptionsMetadata() {
  return await setStorageItem(OPTIONS_METADATA_KEY, JSON.stringify({}));
}