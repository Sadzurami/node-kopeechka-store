/**
 * Options to get a domains list.
 */
export type GetDomainsOptions = {
  /**
   * Switch to get trusted domains.
   *
   * @default true
   */
  trusted?: boolean;

  /**
   * Switch to get temporary domains.
   *
   * @default true
   */
  temporary?: boolean;
};
