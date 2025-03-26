import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP INTERCEPTOR');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl, headers } = req;
        const traceHeader = headers['x-cloud-trace-context'] as string;
        const traceId = traceHeader?.split('/')?.[0];

        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const res = context.switchToHttp().getResponse();
                const latency = Date.now() - now;

                this.logger.log(
                    JSON.stringify({
                        method,
                        path: originalUrl,
                        statusCode: res.statusCode,
                        latencyMs: latency,
                        traceId,
                    }),
                );
            }),
        );
    }
}
