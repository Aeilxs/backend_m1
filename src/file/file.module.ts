import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileController } from './file.controller';

@Module({
    imports: [FirebaseModule],
    providers: [FileService, FirebaseService],
    controllers: [FileController],
})
export class FileModule {}
