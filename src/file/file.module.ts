import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileController } from './file.controller';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Module({
    imports: [FirebaseModule],
    providers: [FileService, FirebaseService, PubSubService],
    controllers: [FileController],
    exports: [FileService],
})
export class FileModule {}
