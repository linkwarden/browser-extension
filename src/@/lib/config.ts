import { getStorageItem, setStorageItem } from './utils.ts';
import { optionsFormValues } from './validators/optionsForm.ts';

const DEFAULTS: optionsFormValues = {
  baseUrl: '',
  username: '',
  password: '',
  syncBookmarks: false,
  usingSSO: false,
  defaultExpanded: false,
  apiKey: '',
  defaultCollection: 'Unorganized',
};

const CONFIG_KEY = 'lw_config_key';

export async function getConfig(): Promise<optionsFormValues> {
  const config = await getStorageItem(CONFIG_KEY);
  return config ? JSON.parse(config) : DEFAULTS;
}

export async function saveConfig(config: optionsFormValues) {
  return await setStorageItem(CONFIG_KEY, JSON.stringify(config));
}

export async function isConfigured() {
  const config = await getConfig();
  return !!config.baseUrl && config.baseUrl !== '' && !!config.apiKey && config.apiKey !== '';
}

export async function clearConfig() {
  return await setStorageItem(CONFIG_KEY, JSON.stringify({
    baseUrl: '',
    username: '',
    password: '',
    syncBookmarks: false,
    usingSSO: false,
    apiKey: '',
    defaultCollection: 'Unorganized',
  }));
}
