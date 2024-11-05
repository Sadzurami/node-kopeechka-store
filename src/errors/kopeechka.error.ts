import { ErrorCode } from '../enums/error.code.enum';
import { ErrorMessage } from '../enums/error.message.enum';

const ErrorCodeValues = new Set(Object.values(ErrorCode) as string[]);

export class KopeechkaError extends Error {
  code: ErrorCode;

  constructor(code?: ErrorCode | string) {
    code = ErrorCodeValues.has(code) ? (code as ErrorCode) : ErrorCode.BadServerResponse;

    super(ErrorMessage[code]);
    this.code = code as ErrorCode;
  }
}
