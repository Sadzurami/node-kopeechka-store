/**
 * Enum for Kopeechka Domain groups.
 */
export enum KopeechkaDomainGroup {
  /**
   * Any temporary email domain.
   */
  Temporary = 'ALL',

  /**
   * Any trusted email domain.
   */
  Trusted = 'REAL',

  /**
   * Any private email domain.
   */
  Private = 'mine',

  /**
   * Any domain from `gmx` group.
   */
  Gmx = 'GMX',

  /**
   * Any domain from `yandex` group.
   */
  Yandex = 'YANDEX',

  /**
   * Any domain from `mail.ru` group.
   */
  Mailru = 'MAILRU',

  /**
   * Any domain from `outlook` & `hotmail` group.
   */
  Outlook = 'OUTLOOK',

  /**
   * Any domain from `mail.com` group.
   */
  Mailcom = 'MAILCOM',

  /**
   * Any domain from `rambler` group.
   */
  Rambler = 'RAMBLER',
}
