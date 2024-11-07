import http from 'http';
import https from 'https';

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
   * Currency for balance and prices.
   *
   * @default 'USD'
   */
  currency?: 'USD' | 'RUB';

  /**
   * Base url for api requests.
   *
   * @default 'https://api.kopeechka.store'
   */
  baseUrl?: string;

  /**
   * Api requests timeout in milliseconds.
   *
   * @default 50000
   */
  timeout?: number;

  /**
   * `https.Agent` or `http.Agent` instance for requests.
   *
   * @default https.Agent
   */
  httpAgent?: https.Agent | http.Agent;
};
