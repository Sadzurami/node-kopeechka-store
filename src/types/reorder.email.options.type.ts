import { OrderEmailOptions } from './order.email.options.type';

/**
 * Options for reordering an email address.
 */
export type ReorderEmailOptions = Omit<OrderEmailOptions, 'domains' | 'sender' | 'invenstor'>;
