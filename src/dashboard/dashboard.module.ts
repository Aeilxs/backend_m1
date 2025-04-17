import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FileModule } from '../file/file.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [FileModule, FirebaseModule],
    providers: [DashboardService],
    controllers: [DashboardController],
    exports: [DashboardService],
})
export class DashboardModule {}
