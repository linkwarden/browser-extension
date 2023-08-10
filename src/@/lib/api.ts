import { DefaultConfig } from './config.ts';

// Just a placeholder for now, until apis routes and token auth are implemented
export class LinkwardenApi {
  configuration: DefaultConfig;

  constructor(conf: DefaultConfig) {
    this.configuration = conf;
  }

  async testConnection() {
    return true;
  }
}