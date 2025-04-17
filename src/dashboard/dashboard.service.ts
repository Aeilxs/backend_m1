import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { Firestore } from 'firebase-admin/firestore';

export interface CoverageHistoryItem {
    requestId: string;
    prompt: string;
    status: 'pending' | 'done';
    response?: string;
    updatedAt: number;
}

export interface DashboardDto {
    totalFiles: number;
    filesByCategory: Record<string, number>;
    pendingCoverageRequests: number;
    completedCoverageRequests: number;
    coverageHistory: CoverageHistoryItem[];
}

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);
    private readonly HISTORY_LIMIT = 20;

    constructor(
        private readonly fileService: FileService,
        @Inject('FIRESTORE') private readonly firestore: Firestore,
    ) {}

    /**
     * Build a synthetic dashboard for a given user.
     */
    async buildDashboard(uid: string): Promise<DashboardDto> {
        this.logger.log(`Building dashboard for user ${uid}`);

        try {
            /* ------------------------------ FILES STATS ------------------------------ */
            const files = await this.fileService.getUserFiles(uid);
            this.logger.debug(`${files.length} file(s) found for user ${uid}`);

            const filesByCategory: Record<string, number> = {};
            for (const path of files) {
                const parts = path.split('/'); // users/{uid}/{category}/{filename}
                const category = parts[2] ?? 'unknown';
                filesByCategory[category] = (filesByCategory[category] ?? 0) + 1;
            }

            /* --------------------------- COVERAGE REQUESTS --------------------------- */
            const snap = await this.firestore.collection('coverage_requests').where('user_uuid', '==', uid).get();

            let pending = 0;
            let completed = 0;
            const coverageHistory: CoverageHistoryItem[] = [];

            snap.forEach((doc) => {
                const data = doc.data();
                const status = data.status as 'pending' | 'done';
                if (status === 'pending') pending += 1;
                else if (status === 'done') completed += 1;

                coverageHistory.push({
                    requestId: doc.id,
                    prompt: data.user_query,
                    status,
                    response: data.response,
                    updatedAt: data.updated_at ?? data.created_at ?? Date.now(),
                });
            });

            coverageHistory.sort((a, b) => b.updatedAt - a.updatedAt);
            const limitedHistory = coverageHistory.slice(0, this.HISTORY_LIMIT);

            this.logger.debug(`Coverage requests – pending: ${pending}, completed: ${completed} for user ${uid}`);

            return {
                totalFiles: files.length,
                filesByCategory,
                pendingCoverageRequests: pending,
                completedCoverageRequests: completed,
                coverageHistory: limitedHistory,
            };
        } catch (err: any) {
            // Firestore failed-precondition (index missing)
            if (err.code === 9 && err.message?.includes('FAILED_PRECONDITION')) {
                this.logger.warn(
                    `Firestore index missing for coverage_requests (user_uuid + created_at). Returning partial dashboard without history for user ${uid}.`,
                );
                return {
                    totalFiles: 0,
                    filesByCategory: {},
                    pendingCoverageRequests: 0,
                    completedCoverageRequests: 0,
                    coverageHistory: [],
                } as DashboardDto;
            }

            this.logger.error(`Failed to build dashboard for user ${uid}: ${err.message}`, err.stack);
            throw new HttpException('Unable to build dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
