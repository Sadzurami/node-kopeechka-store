import { ErrorCode } from '../enums/error.code.enum';
import { ErrorMessage } from '../enums/error.message.enum';
import { StatusCode } from '../enums/status.code.enum';

const ErrorCodeValues = new Set(Object.values(ErrorCode) as string[]);
const StatusCodeValues = new Set(Object.values(StatusCode) as string[]);

export class KopeechkaError extends Error {
  /**
   * Error code returned by the server.
   */
  code: ErrorCode;

  /**
   * Status code returned by the server.
   */
  status: StatusCode;

  constructor(code?: ErrorCode | string, status?: StatusCode | string) {
    code = ErrorCodeValues.has(code) ? (code as ErrorCode) : ErrorCode.BadServerResponse;
    status = StatusCodeValues.has(status) ? (status as StatusCode) : StatusCode.Unknown;

    super(ErrorMessage[code]);

    this.code = code as ErrorCode;
    this.status = status as StatusCode;
  }
}
