/**
 * Enum for error codes.
 */
export enum ErrorCode {
  BAD_SITE = 'Website not found',
  BAD_TOKEN = 'Authorization error',
  BAD_EMAIL = 'Email address not found',
  BAD_DOMAIN = 'Requested domain not found',
  BAD_BALANCE = 'Insufficient funds',
  OUT_OF_STOCK = 'Domain is out of stock',

  WAIT_LINK = 'Message not received',

  NO_ACTIVATION = 'Task not found',
  ACTIVATION_CANCELED = 'Task was canceled',

  SYSTEM_ERROR = 'Server error, contact support',
  TIME_LIMIT_EXCEED = 'Rate limit exceeded',
}
