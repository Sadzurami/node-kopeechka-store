/**
 * Options to get a domains list.
 */
export type GetDomainsOptions = {
  /**
   * Switch to get Kopeechka domains.
   * Like `*.site`, `*.blog`, etc.
   * @default true
   */
  kopeechka?: boolean;

  /**
   * Switch to get trusted domains.
   * Like `gmail.com`, `yahoo.com`, etc.
   * @default true
   */
  trusted?: boolean;

  /**
   * Filter domains by their count.
   *
   * **Note:** Only available for trusted domains.
   */
  count?: {
    min?: number;
    max?: number;
  };

  /**
   * Filter domains by their price.
   *
   * **Note:** Only available for trusted domains.
   */
  price?: {
    min?: number;
    max?: number;
  };
};
