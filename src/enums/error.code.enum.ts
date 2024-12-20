export enum ErrorCode {
  BadSite = 'BAD_SITE',
  BadToken = 'BAD_TOKEN',
  BadEmail = 'BAD_EMAIL',
  NoMessage = 'WAIT_LINK',
  BadDomain = 'BAD_DOMAIN',
  LowBalance = 'BAD_BALANCE',
  OutOfStock = 'OUT_OF_STOCK',
  SystemError = 'SYSTEM_ERROR',
  NoActivation = 'NO_ACTIVATION',
  TimeLimitExceed = 'TIME_LIMIT_EXCEED',
  ActivationCanceled = 'ACTIVATION_CANCELED',

  /**
   * Fallback value for unknown error codes.
   */
  BadServerResponse = 'BAD_SERVER_RESPONSE',
}
