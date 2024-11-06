import { OrderEmailOptions } from './order.email.options.type';

export type ReorderEmailOptions = Omit<OrderEmailOptions, 'domains' | 'sender' | 'invenstor'>;
