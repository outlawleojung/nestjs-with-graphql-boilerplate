import { Logger, Injectable, LoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CustomLogger extends Logger implements LoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {
    super();
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
  }
}
