import { Get, Post, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PlatformAdminProtectedController } from '../decorator/platform-admin-controller.decorator';
import { ManageProductionBackupUseCase } from '../application/use-cases/manage-production-backup.use-case';

@PlatformAdminProtectedController()
export class PlatformAdminBackupController {
    constructor(private readonly backups: ManageProductionBackupUseCase) {}
    @Get('backups')
    @ApiOperation({ summary: 'prod 백업 최근 50건 조회 (관리자 관리 권한 필요)' })
    async list(@CurrentUser('userId') id: string) {
        return ApiResponseDto.success(await this.backups.execute(id, 'list'), '백업 이력을 조회했습니다.');
    }
    @Post('backups')
    @HttpCode(202)
    @ApiOperation({ summary: 'prod 비동기 백업 요청 (DB/버킷 변경 불가)' })
    @ApiResponse({ status: 202, description: '백업 요청 접수. 완료 여부는 목록에서 확인합니다.' })
    async request(@CurrentUser('userId') id: string) {
        return ApiResponseDto.success(await this.backups.execute(id, 'request'), '백업 요청을 접수했습니다.');
    }
}
