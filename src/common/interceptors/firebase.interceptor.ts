import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

// https://firebase.google.com/docs/auth/admin/errors

@Injectable()
export class FirebaseInterceptor implements NestInterceptor {
    private readonly firebaseErrorMap = new Map<string, number>([
        ['auth/email-already-exists', HttpStatus.CONFLICT],
        ['auth/user-not-found', HttpStatus.NOT_FOUND],
    ]);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                console.log('ERROR: ', error);
                if (!error.code || !error.code.startsWith('auth/')) {
                    throw error;
                }

                const statusCode = this.firebaseErrorMap.get(error.code) || HttpStatus.INTERNAL_SERVER_ERROR;

                throw new HttpException(
                    {
                        statusCode,
                        message: error.message || 'Internal Server Error',
                        error: error.code || 'unknown_error',
                    },
                    statusCode,
                );
            }),
        );
    }
}
