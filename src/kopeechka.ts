import got, { Got } from 'got';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import PQueue from 'p-queue';

import TTLCache from '@isaacs/ttlcache';

import { ErrorCode } from './enums/error.code.enum';
import { StatusCode } from './enums/status.code.enum';
import { KopeechkaError } from './errors/kopeechka.error';
import { ConstructorOptions } from './types/constructor.options.type';
import { GetDomainsOptions } from './types/get.domains.options.type';
import { GetMessageOptions } from './types/get.message.options.type';
import { OrderEmailOptions } from './types/order.email.options.type';
import { ReorderEmailOptions } from './types/reorder.email.options.type';
import { WaitMessageOptions } from './types/wait.message.options.type';

const requestsQueue = new PQueue({ interval: 100, intervalCap: 1 });

/**
 * Wrapper around [Kopeechka.Store](https://kopeechka.store/) api
 */
export class Kopeechka {
  private readonly apiBaseUrl: string = 'https://api.kopeechka.store';

  private readonly clientToken: string;
  private readonly clientCurrency: 'USD' | 'RUB' = 'USD';
  private readonly clientPartnerId: string | number = '7';

  private readonly cache: TTLCache<string, any> = new TTLCache({ ttl: 15 * 60 * 1000 });

  private readonly httpAgent: HttpAgent | HttpsAgent;
  private readonly httpClient: Got;

  constructor(options: ConstructorOptions) {
    this.apiBaseUrl = options.baseUrl || this.apiBaseUrl;

    this.clientToken = options.key;
    this.clientCurrency = options.currency || this.clientCurrency;
    this.clientPartnerId = options.partner || this.clientPartnerId;

    this.httpAgent = options.httpAgent || this.createHttpAgent();
    this.httpClient = this.createHttpClient({ timeout: options.timeout });
  }

  /**
   * Orders an email for the specified website.
   *
   * @param website - Website to order the email for.
   * @param options - Additional options.
   * @returns A promise that resolves with the ordered email.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka, DomainGroup } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com', { domains: DomainGroup.Gmx });
   * ```
   */
  public async orderEmail(website: string, options: OrderEmailOptions = {}) {
    try {
      const domains = Array.isArray(options.domains) ? options.domains.join(',') : options.domains;

      const { status, value, id, mail, password } = await this.httpClient
        .get('mailbox-get-email', {
          searchParams: {
            site: website,
            regex: options.regexp || undefined,
            sender: options.sender || undefined,
            subject: options.subject || undefined,
            password: options.password ? 1 : undefined,
            invenstor: options.invenstor ? 1 : undefined,
            mail_type: domains || undefined,
            soft: this.clientPartnerId,
          },
          retry: 0,
        })
        .json<{ status: StatusCode; value?: ErrorCode; id?: string; mail?: string; password?: string }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      this.cache.set(`email:id:${mail}`, id);
      if (password) this.cache.set(`email:password:${mail}`, password);

      return mail;
    } catch (error) {
      throw new Error('Failed to order email', { cause: error });
    }
  }

  /**
   * Reorders an email for the specified website.
   *
   * Use to retrieve additional messages for the requested email.
   *
   * @param website - Website to reorder the email for.
   * @param email - Email to reorder.
   * @param options - Additional options.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.reorderEmail('example.com', 'example.email@gmail.com');
   * ```
   */
  public async reorderEmail(website: string, email: string, options: ReorderEmailOptions = {}) {
    try {
      const { status, value, id, mail, password } = await this.httpClient
        .get('mailbox-reorder', {
          searchParams: {
            site: website,
            email: email,
            regex: options.regexp || undefined,
            subject: options.subject || undefined,
            password: options.password ? 1 : undefined,
          },
        })
        .json<{ status: StatusCode; value?: ErrorCode; id?: string; mail?: string; password?: string }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      this.cache.set(`email:id:${mail}`, id);
      if (password) this.cache.set(`email:password:${mail}`, password);
    } catch (error) {
      throw new Error('Failed to reorder email', { cause: error });
    }
  }

  /**
   * Cancels or releases the specified email.
   *
   * @param email - Email to cancel.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   *
   * try {
   *   // do something with the email
   * } finally {
   *   await kopeechka.cancelEmail(email);
   * }
   */
  public async cancelEmail(email: string) {
    try {
      const id = this.getEmailId(email);

      const { status, value } = await this.httpClient
        .get('mailbox-cancel', { searchParams: { id } })
        .json<{ status: StatusCode; value?: ErrorCode }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      this.cache.delete(`email:id:${email}`);
      this.cache.delete(`email:password:${email}`);
    } catch (error) {
      throw new Error('Failed to cancel email', { cause: error });
    }
  }

  /**
   * Retrieves the id associated with the email.
   *
   * @param email - The email to retrieve the id for.
   * @returns The id of the specified email.
   *
   * @throws Will throw an error if the email id is not found.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   * const emailId = kopeechka.getEmailId(email);
   * ```
   */
  public getEmailId(email: string) {
    if (!this.cache.has(`email:id:${email}`)) throw new Error('Email id not found');

    return this.cache.get(`email:id:${email}`) as string;
  }

  /**
   * Refreshes the id associated with the specified email.
   *
   * @param website - The website to refresh the email id for.
   * @param email - The email to refresh the id for.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   * await kopeechka.refreshEmailId('example.com', email);
   * ```
   */
  public async refreshEmailId(website: string, email: string) {
    try {
      const { status, value, id } = await this.httpClient
        .get('mailbox-get-fresh-id', { searchParams: { site: website, email } })
        .json<{ status: StatusCode; value?: ErrorCode; id?: string }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      this.cache.set(`email:id:${email}`, id);
    } catch (error) {
      throw new Error('Failed to refresh email id', { cause: error });
    }
  }

  /**
   * Retrieves the password associated with the specified email.
   *
   * This password allows access to [web interface](https://webmail.kopeechka.store/) for the specified email.
   *
   * **NOTE:** You must include the `password` option when ordering the email.
   *
   * @param email - The email to retrieve the password for.
   * @returns The password of the specified email.
   *
   * @throws Will throw an error if the email password is not found.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   * const emailPassword = kopeechka.getEmailPassword(email);
   * ```
   */
  public getEmailPassword(email: string) {
    if (!this.cache.has(`email:password:${email}`)) throw new Error('Email password not found');

    return this.cache.get(`email:password:${email}`) as string;
  }

  /**
   * Retrieves the account balance.
   *
   * @returns A promise that resolves with the account balance.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const balance = await kopeechka.getBalance();
   * ```
   */
  public async getBalance() {
    try {
      const { status, value, balance } = await this.httpClient
        .get('user-balance', { searchParams: { cost: this.clientCurrency } })
        .json<{ status: StatusCode; value?: ErrorCode; balance?: number }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      return balance;
    } catch (error) {
      throw new Error('Failed to get balance', { cause: error });
    }
  }

  /**
   * Retrieves the message of the specified email.
   *
   * By default, returns a short value of the message if possible.
   *
   * Set `option.full` to `true` to always get the full message.
   *
   * @param email - The email to get the message for.
   * @param options - Additional options.
   * @returns A promise that resolves with the parsed value or full message, or `null` if the message is not found.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   * const message = await kopeechka.getMessage(email);
   * ```
   */
  public async getMessage(email: string, options: GetMessageOptions = {}): Promise<string | null> {
    try {
      const id = this.getEmailId(email);

      const { status, value, fullmessage } = await this.httpClient
        .get('mailbox-get-message', { searchParams: { id, full: options.full ? 1 : undefined } })
        .json<{ status: StatusCode; value?: ErrorCode; fullmessage?: string }>();

      if (status !== StatusCode.Success) {
        if (value === ErrorCode.NoMessage) return null;
        else throw new KopeechkaError(value);
      }

      const message = options.full || !value ? fullmessage : value;

      return message;
    } catch (error) {
      throw new Error('Failed to get message', { cause: error });
    }
  }

  /**
   * Like `.getMessage()` but waits for the message and throws if not found.
   *
   * @param email - The email to get the message for.
   * @param options - Additional options.
   * @returns A promise that resolves with the parsed value or full message.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   * @throws Will throw an error if the message is not found within the given time.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com');
   * const message = await kopeechka.waitMessage(email);
   * ```
   */
  public async waitMessage(email: string, options: WaitMessageOptions = {}) {
    options = { timeout: 100000, ...options };

    return await new Promise<string>((resolve, reject) => {
      const start: number = Date.now();
      const delay: number = 5000;

      const check = async () => {
        try {
          const message = await this.getMessage(email, options);

          if (message !== null) {
            resolve(message);
            return;
          }

          if (Date.now() - start >= options.timeout) {
            reject(new KopeechkaError(ErrorCode.NoMessage));
            return;
          }

          setTimeout(check, delay);
        } catch (error) {
          reject(error);
          return;
        }
      };

      check();
    });
  }

  /**
   * Retrieves the domains list.
   *
   * @param website - The website to get domains for.
   * @param options - Additional options.
   * @returns A promise that resolves with the domains list.
   *
   * @throws Will throw an error due to network issues, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const domains = await kopeechka.getDomains('example.com');
   * ```
   */
  public async getDomains(website?: string, options: GetDomainsOptions = { trusted: true, kopeechka: true }) {
    try {
      const promises: Promise<string[]>[] = [];

      if (options.trusted) promises.push(this.fetchTrustedDomains(website, options));
      if (options.kopeechka) promises.push(this.fetchKopeechkaDomains(website));

      return (await Promise.all(promises)).flat();
    } catch (error) {
      throw new Error('Failed to get domains', { cause: error });
    }
  }

  private async fetchTrustedDomains(website?: string, options: Pick<GetDomainsOptions, 'count' | 'price'> = {}) {
    try {
      const { status, value, popular } = await this.httpClient
        .get('mailbox-zones', { searchParams: { site: website || undefined, popular: 1, cost: this.clientCurrency } })
        .json<{
          status: StatusCode;
          value?: ErrorCode;
          popular?: { name: string; cost: string | number; count: number }[];
        }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      let entries = popular;

      if (options.count) {
        entries = entries.filter((entry) => {
          if (options.count.min && entry.count < options.count.min) return false;
          if (options.count.max && entry.count > options.count.max) return false;
          return true;
        });
      }

      if (options.price) {
        entries = entries.filter((entry) => {
          const cost = Number(entry.cost.toString());
          if (options.price.min && cost < options.price.min) return false;
          if (options.price.max && cost > options.price.max) return false;
          return true;
        });
      }

      return entries.map((entry) => entry.name);
    } catch (error) {
      throw new Error('Failed to fetch trusted domains', { cause: error });
    }
  }

  private async fetchKopeechkaDomains(website?: string) {
    try {
      const { status, value, domains } = await this.httpClient
        .get('mailbox-get-domains', { searchParams: { site: website || undefined } })
        .json<{ status: StatusCode; value?: ErrorCode; count?: number; domains?: string[] }>();

      if (status !== StatusCode.Success) throw new KopeechkaError(value);

      return domains;
    } catch (error) {
      throw new Error('Failed to fetch kopeechka domains', { cause: error });
    }
  }

  private createHttpAgent() {
    const useSSL = this.apiBaseUrl.startsWith('https://');

    const options = { keepAlive: true, timeout: 65000, maxSockets: 50 };

    const agent = useSSL ? new HttpsAgent(options) : new HttpAgent(options);

    return agent;
  }

  private createHttpClient(options: { timeout?: number } = {}) {
    const useSSL = this.apiBaseUrl.startsWith('https://');

    const client = got.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        accept: 'application/json',
        'user-agent': 'node-kopeechka-store/1.0',
      },
      searchParams: { token: this.clientToken, type: 'JSON', api: '2.0' },
      agent: useSSL ? { https: this.httpAgent as any } : { http: this.httpAgent },
      hooks: { beforeRequest: [() => requestsQueue.add(() => {})] },
      timeout: options.timeout || 50000,
      responseType: 'json',
      throwHttpErrors: true,
    });

    return client;
  }
}
