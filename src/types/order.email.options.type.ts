import { KopeechkaDomainGroup } from '../enums/kopeechka.domain.group.enum';

/**
 * Options for ordering an email address.
 */
export type OrderEmailOptions = {
  /**
   * Domain group(s) for the email address.
   *
   * @example
   * domains: 'gmail.com'
   * domains: DomainGroup.Temporary
   * domains: ['mail.com', 'gmx.com', 'hotmail.com']
   * domains: [DomainGroup.Gmx, DomainGroup.Mailcom]
   */
  domains?: KopeechkaDomainGroup | KopeechkaDomainGroup[] | string | string[];

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