import { DefaultConfig } from './config.ts';

// Just a placeholder for now, until apis routes and token auth are implemented
// TODO: Implement apis routes and token auth, if not possible on just queries for react query, I don't really want to manage it on a separate class
export class LinkwardenApi {
  configuration: DefaultConfig;

  constructor(conf: DefaultConfig) {
    this.configuration = conf;
  }

  async testConnection() {
    return true;
  }
}