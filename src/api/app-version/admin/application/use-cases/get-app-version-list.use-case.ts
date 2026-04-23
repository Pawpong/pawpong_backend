import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionAdminPageAssemblerService } from '../../domain/services/app-version-admin-page-assembler.service';
import { APP_VERSION_ADMIN_READER_PORT, type AppVersionAdminReaderPort } from '../ports/app-version-admin-reader.port';
import { type AppVersionAdminListQuery, type AppVersionAdminPageResult } from '../types/app-version-query.type';

@Injectable()
export class GetAppVersionListUseCase {
    constructor(
        @Inject(APP_VERSION_ADMIN_READER_PORT)
        private readonly appVersionAdminReader: AppVersionAdminReaderPort,
        private readonly appVersionAdminPageAssemblerService: AppVersionAdminPageAssemblerService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(paginationData: AppVersionAdminListQuery): Promise<AppVersionAdminPageResult> {
        this.logger.logStart('getAppVersionList', '앱 버전 목록 조회 시작', paginationData);

        const page = paginationData.page ?? 1;
        const limit = paginationData.limit ?? 10;

        try {
            const { items, totalItems } = await this.appVersionAdminReader.readPage(page, limit);

            this.logger.logSuccess('getAppVersionList', '앱 버전 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return this.appVersionAdminPageAssemblerService.build(items, page, limit, totalItems);
        } catch (error) {
            this.logger.logError('getAppVersionList', '앱 버전 목록 조회', error);
            throw error;
        }
    }
}
