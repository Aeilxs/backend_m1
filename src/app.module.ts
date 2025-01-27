import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { VertexAIModule } from './vertex-ai/vertex-ai.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FirebaseModule.forRoot(require(process.env.FIREBASE_CONFIG_CREDENTIAL)),
        AuthModule,
        FileModule,
        UserModule,
        KafkaModule.register(),
        VertexAIModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
