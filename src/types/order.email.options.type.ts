import { DomainGroup } from '../enums/domain.group.enum';

export type OrderEmailOptions = {
  /**
   * Email domain(s) to get.
   *
   * If omitted, the server returns any domain owned by `Kopeechka`.
   *
   * If an array or group of domains is provided, the server returns one randomly.
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
   * **Note:** This regex is sent as a query parameter to the server, not used locally.
   */
  regexp?: string;

  /**
   * Sender's email address.
   *
   * @example
   * sender: 'noreply@example.com'
   */
  sender?: string;

  /**
   * Message subject.
   *
   * @example
   * subject: 'Welcome to Our Service'
   */
  subject?: string;

  /**
   * Switch to get the email's password for [web interface](https://webmail.kopeechka.store/).
   */
  password?: boolean;

  /**
   * Switch to use an email from your own pool.
   */
  invenstor?: boolean;
};
