import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { BreederManagementBannerResultMapperService } from '../../domain/services/breeder-management-banner-result-mapper.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementProfileBannerUpdateCommand } from '../types/breeder-management-admin-banner-command.type';
import type { BreederManagementProfileBannerResult } from '../types/breeder-management-admin-banner-result.type';

@Injectable()
export class UpdateProfileBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerResultMapperService: BreederManagementBannerResultMapperService,
    ) {}

    async execute(
        bannerId: string,
        data: BreederManagementProfileBannerUpdateCommand,
    ): Promise<BreederManagementProfileBannerResult> {
        const banner = await this.bannerWriter.updateProfile(bannerId, data);

        if (!banner) {
            throw new DomainNotFoundError('프로필 배너를 찾을 수 없습니다.');
        }

        return this.breederManagementBannerResultMapperService.toProfileResult(banner);
    }
}
