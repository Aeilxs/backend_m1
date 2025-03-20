import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FirebaseInterceptor } from './common/interceptors/firebase.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(new FirebaseInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalGuards(new FirebaseAuthGuard(app.get(Reflector), app.get(AuthService)));

    const config = new DocumentBuilder()
        .setTitle('Contract Central API documentation')
        .setVersion('1.0')
        .addTag('auth')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, documentFactory);

    app.enableCors();
    await app.listen(8080);
}

bootstrap();
