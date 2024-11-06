export enum DomainGroup {
  /**
   * Any domain owned by `Kopeechka` (e.g., `*.site`, `*.blog`, `*.pro`).
   */
  Kopeechka = 'ALL',

  /**
   * Any trusted email domain (e.g., `gmail.com`, `yahoo.com`).
   */
  Trusted = 'REAL',

  /**
   * Any private domain owned by the client.
   */
  Private = 'mine',

  /**
   * Any domain from the `gmx` group.
   */
  Gmx = 'GMX',

  /**
   * Any domain from the `yandex` group.
   */
  Yandex = 'YANDEX',

  /**
   * Any domain from the `mail.ru` group.
   */
  Mailru = 'MAILRU',

  /**
   * Any domain from the `outlook` & `hotmail` group.
   */
  Outlook = 'OUTLOOK',

  /**
   * Any domain from the `mail.com` group.
   */
  Mailcom = 'MAILCOM',

  /**
   * Any domain from the `rambler` group.
   */
  Rambler = 'RAMBLER',
}
