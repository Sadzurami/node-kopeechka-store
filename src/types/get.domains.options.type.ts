/**
 * Options to get a domains list.
 */
export type GetDomainsOptions = {
  /**
   * Switch to get Kopeechka domains.
   *
   * @default true
   */
  kopeechka?: boolean;

  /**
   * Switch to get trusted domains.
   *
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
