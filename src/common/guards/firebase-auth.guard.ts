import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { IS_PUBLIC_KEY } from '@decorators';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    private readonly logger = new Logger(FirebaseAuthGuard.name);
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublicRoute = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
        if (isPublicRoute) {
            this.logger.log('Public route, no check');
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.logger.error('Invalid header');
            throw new UnauthorizedException('Invalid header');
        }

        const token = authHeader.split(' ')[1];

        this.logger.log('Validating token ...');
        try {
            const decodedToken = await this.authService.checkToken(token);
            request.user = decodedToken;
            this.logger.log('Token validated');
            return true;
        } catch (error) {
            this.logger.error("Couldn't verify token: ", error);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
