import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AppVersionAdminListPresentationService } from '../../domain/services/app-version-admin-list-presentation.service';
import { APP_VERSION_ADMIN_READER_PORT, type AppVersionAdminReaderPort } from '../ports/app-version-admin-reader.port';
import { type AppVersionAdminListQuery, type AppVersionAdminPageResult } from '../types/app-version-query.type';

@Injectable()
export class GetAppVersionListUseCase {
    constructor(
        @Inject(APP_VERSION_ADMIN_READER_PORT)
        private readonly appVersionAdminReader: AppVersionAdminReaderPort,
        private readonly appVersionAdminListPresentationService: AppVersionAdminListPresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        paginationData: AppVersionAdminListQuery,
    ): Promise<AppVersionAdminPageResult> {
        this.logger.logStart('getAppVersionList', '앱 버전 목록 조회 시작', paginationData);

        const page = paginationData.page ?? 1;
        const limit = paginationData.limit ?? 10;

        try {
            const { items, totalItems } = await this.appVersionAdminReader.readPage(page, limit);

            this.logger.logSuccess('getAppVersionList', '앱 버전 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return this.appVersionAdminListPresentationService.toPaginationResponse(items, page, limit, totalItems);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('getAppVersionList', '앱 버전 목록 조회', error);
            throw new BadRequestException('앱 버전 목록 조회에 실패했습니다.');
        }
    }
}
