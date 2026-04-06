import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class DeleteCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
    ) {}

    async execute(bannerId: string): Promise<void> {
        const deleted = await this.bannerWriter.deleteCounsel(bannerId);

        if (!deleted) {
            throw new BadRequestException('상담 배너를 찾을 수 없습니다.');
        }
    }
}
