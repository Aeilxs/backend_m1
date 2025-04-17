import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { DashboardDto } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    /**
     * GET /dashboard
     */
    @Get()
    @ApiOperation({ summary: 'Get dashboard for current user' })
    @ApiResponse({ status: 200, description: 'Dashboard data returned successfully.' })
    async getDashboard(@User() u: DecodedIdToken): Promise<DashboardDto> {
        return this.dashboardService.buildDashboard(u.uid);
    }
}
