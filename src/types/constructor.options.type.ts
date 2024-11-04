import { Agent } from 'https';

/**
 * Kopeechka class constructor options.
 */
export type ConstructorOptions = {
  /**
   * Api access key.
   */
  key: string;

  /**
   * Affiliate program id.
   */
  partner?: string | number;

  /**
   * Base url for the api requests.
   */
  baseUrl?: string;

  /**
   * `https.Agent` instance to use for requests.
   */
  httpsAgent?: Agent;
};
