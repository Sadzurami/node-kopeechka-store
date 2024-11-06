import { GetMessageOptions } from './get.message.options.type';

export type WaitMessageOptions = GetMessageOptions & {
  /**
   * Timeout in milliseconds.
   *
   * @default 100000
   */
  timeout?: number;
};
