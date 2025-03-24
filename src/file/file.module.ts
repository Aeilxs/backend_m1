import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FileController } from './file.controller';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Module({
    imports: [FirebaseModule],
    providers: [FileService, PubSubService],
    controllers: [FileController],
    exports: [FileService],
})
export class FileModule {}
