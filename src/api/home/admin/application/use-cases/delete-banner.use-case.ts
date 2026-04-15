import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class DeleteBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
    ) {}

    async execute(bannerId: string): Promise<void> {
        const deleted = await this.homeAdminManager.deleteBanner(bannerId);

        if (!deleted) {
            throw new DomainNotFoundError('배너를 찾을 수 없습니다.');
        }
    }
}
