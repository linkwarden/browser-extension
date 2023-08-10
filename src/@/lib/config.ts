import { getStorageItem, setStorageItem } from './utils.ts';

export interface DefaultConfig {
  baseUrl: string;
  apiToken: string;
}

const DEFAULTS: DefaultConfig = {
  baseUrl: '',
  apiToken: '',
};
const CONFIG_KEY = 'lw_config_key';

export async function getConfig(): Promise<DefaultConfig> {
  const config = await getStorageItem(CONFIG_KEY);
  return config ? JSON.parse(config) : DEFAULTS;
}

export async function saveConfig(config: DefaultConfig) {
  return await setStorageItem(CONFIG_KEY, JSON.stringify(config));
}

export async function isConfigured() {
  const config = await getConfig();
  return !!config.baseUrl && !!config.apiToken;
}

export async function clearConfig() {
  return await setStorageItem(CONFIG_KEY, JSON.stringify({}));
}