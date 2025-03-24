import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FirebaseInterceptor implements NestInterceptor {
    private readonly logger = new Logger(FirebaseInterceptor.name);

    private readonly firebaseErrorMap = new Map<string, number>([
        ['auth/email-already-exists', HttpStatus.CONFLICT],
        ['auth/user-not-found', HttpStatus.NOT_FOUND],
    ]);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                this.logger.error('Caught error in FirebaseInterceptor', error);

                if (typeof error?.code === 'string' && error.code.startsWith('auth/')) {
                    const statusCode = this.firebaseErrorMap.get(error.code) || HttpStatus.INTERNAL_SERVER_ERROR;

                    return throwError(
                        () =>
                            new HttpException(
                                {
                                    statusCode,
                                    message: error.message || 'Internal Server Error',
                                    error: error.code,
                                },
                                statusCode,
                            ),
                    );
                }

                // don't transform other errors
                return throwError(() => error);
            }),
        );
    }
}
