import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileController } from './file.controller';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
    imports: [FirebaseModule, KafkaModule],
    providers: [FileService, FirebaseService],
    controllers: [FileController],
    exports: [FileService],
})
export class FileModule {}
