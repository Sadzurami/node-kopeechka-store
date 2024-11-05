import { DomainGroup } from '../enums/domain.group.enum';

/**
 * Options for ordering an email address.
 */
export type OrderEmailOptions = {
  /**
   * Email domain(s) you want to get.
   *
   * If omitted, the server will return any domain owned by `Kopeechka`.
   *
   * If an array or group of domains is provided, the server will return one of them randomly.
   *
   * @example
   * domains: 'gmail.com'
   * domains: DomainGroup.Kopeechka
   * domains: ['mail.com', 'gmx.com', 'hotmail.com']
   * domains: [DomainGroup.Gmx, DomainGroup.Mailcom]
   */
  domains?: string | string[] | DomainGroup | DomainGroup[];

  /**
   * Regular expression for extracting values from the message.
   *
   * **Note:**
   * This regex is sent as a regex query parameter to the server, not used locally.
   */
  regexp?: string;

  /**
   * Email address of the sender.
   *
   * @example
   * sender: 'noreply@example.com'
   */
  sender?: string;

  /**
   * Subject of the email.
   *
   * @example
   * subject: 'Welcome to Our Service'
   */
  subject?: string;

  /**
   * Switch to get the password of the email address.
   * This password allows to use [web access](https://webmail.kopeechka.store/).
   */
  password?: boolean;

  /**
   * Switch to use an email from your own pool.
   */
  invenstor?: boolean;
};
