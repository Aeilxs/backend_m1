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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FirebaseModule.forRoot(),
        AuthModule,
        FileModule,
        UserModule,
        VertexAIModule,
        PubSubModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
