import got, { Got } from 'got';
import { Agent } from 'https';
import PQueue from 'p-queue';

import TTLCache from '@isaacs/ttlcache';

import { KopeechkaErrorCode } from './enums/kopeechka.error.code.enum';
import { ConstructorOptions } from './types/constructor.options.type';
import { GetDomainsOptions } from './types/get.domains.options.type';
import { GetMessageOptions } from './types/get.message.options.type';
import { OrderEmailOptions } from './types/order.email.options.type';
import { ReorderEmailOptions } from './types/reorder.email.options.type';

const requestsQueue = new PQueue({ interval: 100, intervalCap: 1 });

/**
 * Wrapper around for [Kopeechka.Store](https://kopeechka.store/) api.
 */
export class Kopeechka {
  private readonly baseApiUrl: string = 'https://api.kopeechka.store';

  private readonly clientToken: string;
  private readonly clientPartnerId: string | number = '7';

  private readonly cache: TTLCache<string, any> = new TTLCache({ ttl: 15 * 60 * 1000 });

  private readonly httpAgent: Agent;
  private readonly httpClient: Got;

  constructor(options: ConstructorOptions) {
    this.baseApiUrl = options.baseUrl || this.baseApiUrl;

    this.clientToken = options.key;
    this.clientPartnerId = options.partner || this.clientPartnerId;

    this.httpAgent = options.httpsAgent || this.createHttpAgent();
    this.httpClient = this.createHttpClient();
  }

  /**
   * Orders an email address for the specified website.
   *
   * @param website - The website to order the email address for.
   * @param options - Additional options for ordering the email address.
   * @returns The ordered email address.
   *
   * @throws Will throw an error due to network problems, server errors, etc.
   *
   * @example
   * ```
   * import { Kopeechka, KopeechkaDomainGroup } from '@sadzurami/kopeechka-store';
   *
   * const key = 'your-api-key';
   * const kopeechka = new Kopeechka({ key });
   *
   * const email = await kopeechka.orderEmail('example.com', { domains: KopeechkaDomainGroup.Gmx });
   * ```
   */
  public async orderEmail(website: string, options: OrderEmailOptions = {}) {
    try {
      const domains = Array.isArray(options.domains) ? options.domains.join(',') : options.domains;

      const { status, value, id, mail, password } = await this.httpClient
        .get('mailbox-get-email', {
          searchParams: {
            site: website,
            regex: options.regexp,
            sender: options.sender,
            subject: options.subject,
            password: options.password ? 1 : undefined,
            invenstor: options.invenstor ? 1 : undefined,
            mail_type: domains,
            soft: this.clientPartnerId,
          },
        })
        .json<{ status: 'OK' | 'ERROR'; value?: string; id?: string; mail?: string; password?: string }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      this.cache.set(mail, id);
      if (password) this.cache.set(`${mail}:password`, password);

      return mail;
    } catch (error) {
      throw new Error('Failed to order email address', { cause: error });
    }
  }

  /**
   * Reorders an email address for the specified website.
   *
   * Use this method to retrieve new messages for the requested email address.
   *
   * @param website - The website to order the email address for.
   * @param email - The email address to reorder.
   * @param options - Additional options for reordering the email address.
   * @returns The reordered email address.
   *
   * @throws Will throw an error due to network problems, server errors, etc.
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
            regex: options.regexp,
            subject: options.subject,
            password: options.password ? 1 : undefined,
          },
        })
        .json<{ status: 'OK' | 'ERROR'; value?: string; id?: string; mail?: string; password?: string }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      this.cache.set(mail, id);
      if (password) this.cache.set(`${mail}:password`, password);
    } catch (error) {
      throw new Error('Failed to reorder email address', { cause: error });
    }
  }

  /**
   * Cancels or releases the specified email address.
   *
   * @param email - The email address to cancel.
   * 
   * @throws Will throw an error due to network problems, server errors, etc.
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
       await kopeechka.cancelEmail(email);
   * }
   */
  public async cancelEmail(email: string) {
    try {
      const id = this.getEmailId(email);

      const { status, value } = await this.httpClient
        .get('mailbox-cancel', { searchParams: { id } })
        .json<{ status: 'OK' | 'ERROR'; value?: string }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      this.cache.delete(id);
      this.cache.delete(`${email}:password`);
    } catch (error) {
      throw new Error('Failed to cancel email address', { cause: error });
    }
  }

  /**
   * Retrieves the ID associated with the email address.
   *
   * @param email - The email address to retrieve the ID for.
   * @returns The ID of the specified email address.
   *
   * @throws Will throw an error if the email ID is not found.
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
    if (!this.cache.has(email)) throw new Error('Email id not found');

    return this.cache.get(email) as string;
  }

  /**
   * Retrieves the password associated with the specified email address.
   *
   * This password allows access to [web interface](https://webmail.kopeechka.store/) for the specified email address.
   *
   * **NOTE:** You must include the `password` option when ordering the email address.
   *
   * @param email - The email address to retrieve the password for.
   * @returns The password of the specified email address.
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
    if (!this.cache.has(`${email}:password`)) throw new Error('Email password not found');

    return this.cache.get(`${email}:password`) as string;
  }

  /**
   * Retrieves the balance of the account.
   *
   * @returns The balance of the account.
   *
   * @throws Will throw an error due to network problems, server errors, etc.
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
        .get('user-balance')
        .json<{ status: 'OK' | 'ERROR'; value?: string; balance?: number }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      return balance;
    } catch (error) {
      throw new Error('Failed to get balance', { cause: error });
    }
  }

  /**
   * Retrieves the message of the specified email address.
   *
   * By default, this method returns only a short value of the message if possible.
   *
   * You can set the `option.full` to `true` to always get the full message instead.
   *
   * @param email - The email address to get the message for.
   * @param options - Additional options for getting the message.
   * @returns Short value or full message, or `null` if the message is not received yet.
   *
   * @throws Will throw an error due to network problems, server errors, etc.
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
        .json<{ status: 'OK' | 'ERROR'; value?: string; fullmessage?: string }>();

      if (status !== 'OK') {
        if (value === 'WAIT_LINK') return null;
        throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');
      }

      return options.full || !value ? fullmessage : value;
    } catch (error) {
      throw new Error('Failed to get message', { cause: error });
    }
  }

  /**
   * Retrieves the domains list for the specified website.
   *
   * @param website - The website to get domains for.
   * @param options - Additional options for getting domains.
   * @returns The domains of the specified website.
   *
   * @throws Will throw an error due to network problems, server errors, etc.
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
  public async getDomains(website: string, options: GetDomainsOptions = { trusted: true, temporary: true }) {
    try {
      const promises: Promise<string[]>[] = [];

      if (options.trusted) promises.push(this.fetchTrustedDomains(website));
      if (options.temporary) promises.push(this.fetchTemporaryDomains(website));

      return (await Promise.all(promises)).flat();
    } catch (error) {
      throw new Error('Failed to get domains', { cause: error });
    }
  }

  private async fetchTrustedDomains(website: string) {
    try {
      const { status, value, popular } = await this.httpClient
        .get('mailbox-zones', { searchParams: { site: website, popular: 1 } })
        .json<{ status: 'OK' | 'ERROR'; value?: string; popular?: { name: string; cost: string; count: number }[] }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      return popular.map((entry) => entry.name);
    } catch (error) {
      throw new Error('Failed to fetch trusted domains', { cause: error });
    }
  }

  private async fetchTemporaryDomains(website: string) {
    try {
      const { status, value, domains } = await this.httpClient
        .get('mailbox-get-domains', { searchParams: { site: website } })
        .json<{ status: 'OK' | 'ERROR'; value?: string; count?: number; domains?: string[] }>();

      if (status !== 'OK') throw new Error((value && KopeechkaErrorCode[value]) || value || 'Bad server response');

      return domains;
    } catch (error) {
      throw new Error('Failed to fetch temporary domains', { cause: error });
    }
  }

  private createHttpAgent() {
    const agent = new Agent({ keepAlive: true, timeout: 65000, maxSockets: 50 });

    return agent;
  }

  private createHttpClient() {
    const client = got.extend({
      prefixUrl: this.baseApiUrl,
      headers: {
        accept: 'application/json',
        'user-agent': 'node-kopeechka-store/1.0',
      },
      searchParams: { token: this.clientToken, type: 'JSON', api: '2.0' },
      agent: { https: this.httpAgent },
      hooks: { beforeRequest: [() => requestsQueue.add(() => {})] },
      timeout: 60000,
      responseType: 'json',
      throwHttpErrors: true,
    });

    return client;
  }
}
