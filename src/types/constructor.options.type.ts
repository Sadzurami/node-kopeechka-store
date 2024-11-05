import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

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
   * Currency to use for balance and prices.
   * @default 'USD'
   */
  currency?: 'USD' | 'RUB';

  /**
   * Base url for the api requests.
   * @default 'https://api.kopeechka.store'
   */
  baseUrl?: string;

  /**
   * Api requests timeout in milliseconds.
   * @default 50000
   */
  timeout?: number;

  /**
   * `https.Agent` or `http.Agent` instance to use for requests.
   *  @default https.Agent
   */
  httpAgent?: HttpsAgent | HttpAgent;
};
