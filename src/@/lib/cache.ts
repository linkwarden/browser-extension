import { getStorageItem, setStorageItem } from './utils.ts';
import { optionsFormValues } from './validators/optionsForm.ts';

const OPTIONS_METADATA_KEY = 'lw_options_metadata_cache';

// TODO: Implement caching for tabs metadata maybe?
export async function getCachedOptionsMetadata(): Promise<optionsFormValues> {
  const cache = await getStorageItem(OPTIONS_METADATA_KEY);
  return cache ? JSON.parse(cache) : {};
}

export async function setCachedOptionsMetadata(metadata: optionsFormValues) {
  return await setStorageItem(OPTIONS_METADATA_KEY, JSON.stringify(metadata));
}

export async function clearCachedOptionsMetadata() {
  return await setStorageItem(OPTIONS_METADATA_KEY, JSON.stringify({}));
}