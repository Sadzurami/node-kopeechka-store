/**
 * Enum for domain groups.
 */
export enum DomainGroup {
  /**
   * Any domain owned by `Kopeechka`.
   *
   * Like `*.site`, `*.blog`, `*.pro` etc.
   */
  Kopeechka = 'ALL',

  /**
   * Any trusted email domain.
   *
   * Like `gmail.com`, `yahoo.com` etc.
   */
  Trusted = 'REAL',

  /**
   * Any private domain owned by client.
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
