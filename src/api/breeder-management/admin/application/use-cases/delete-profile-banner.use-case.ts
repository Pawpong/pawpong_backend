import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class DeleteProfileBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
    ) {}

    async execute(bannerId: string): Promise<void> {
        const deleted = await this.bannerWriter.deleteProfile(bannerId);

        if (!deleted) {
            throw new DomainNotFoundError('프로필 배너를 찾을 수 없습니다.');
        }
    }
}
