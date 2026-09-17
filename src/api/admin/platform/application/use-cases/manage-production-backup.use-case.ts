import { Inject, Injectable } from '@nestjs/common';
import { DomainAuthorizationError } from '../../../../../common/error/domain.error';
import { PLATFORM_ADMIN_READER_PORT, type PlatformAdminReaderPort } from '../ports/platform-admin-reader.port';
import { PRODUCTION_BACKUP, type ProductionBackupPort } from '../ports/production-backup.port';

/** DB 덤프는 일반 통계 권한이 아닌 관리자 관리 권한을 가진 운영자만 요청한다. */
@Injectable()
export class ManageProductionBackupUseCase {
    constructor(
        @Inject(PLATFORM_ADMIN_READER_PORT) private readonly admins: PlatformAdminReaderPort,
        @Inject(PRODUCTION_BACKUP) private readonly backups: ProductionBackupPort,
    ) {}
    async execute(adminId: string, action: 'list' | 'request') {
        const admin = await this.admins.findAdminById(adminId);
        if (!admin?.permissions?.canManageAdmins) throw new DomainAuthorizationError('백업 관리 권한이 필요합니다.');
        return action === 'list' ? this.backups.list() : this.backups.request(adminId);
    }
}
