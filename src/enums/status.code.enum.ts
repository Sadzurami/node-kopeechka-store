export enum StatusCode {
  /**
   * Indicates that request was successful.
   */
  Success = 'OK',

  /**
   * Indicates that server returned an error.
   */
  Error = 'ERROR',

  /**
   * Fallback value for unknown status codes.
   */
  Unknown = 'UNKNOWN',
}
