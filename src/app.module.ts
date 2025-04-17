import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { VertexAIModule } from './vertex-ai/vertex-ai.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { LoggerModule } from 'nestjs-pino';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({
            pinoHttp: {
                customProps: (req) => {
                    const traceHeader = req.headers['x-cloud-trace-context'] as string;
                    const traceId = traceHeader?.split('/')?.[0];
                    return {
                        traceId,
                        requestId: req.headers['x-request-id'] || undefined,
                    };
                },
            },
        }),
        FirebaseModule.forRoot(),
        AuthModule,
        FileModule,
        UserModule,
        VertexAIModule,
        PubSubModule,
        DashboardModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
