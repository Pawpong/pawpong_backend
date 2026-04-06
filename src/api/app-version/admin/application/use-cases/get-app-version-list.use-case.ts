import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminPresentationService } from '../../domain/services/app-version-admin-presentation.service';
import { APP_VERSION_ADMIN_READER, type AppVersionAdminReaderPort } from '../ports/app-version-admin-reader.port';

@Injectable()
export class GetAppVersionListUseCase {
    constructor(
        @Inject(APP_VERSION_ADMIN_READER)
        private readonly appVersionAdminReader: AppVersionAdminReaderPort,
        private readonly appVersionAdminPresentationService: AppVersionAdminPresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        paginationData: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AppVersionResponseDto>> {
        this.logger.logStart('getAppVersionList', '앱 버전 목록 조회 시작', paginationData);

        const page = paginationData.page ?? 1;
        const limit = paginationData.limit ?? 10;

        try {
            const { items, totalItems } = await this.appVersionAdminReader.readPage(page, limit);

            this.logger.logSuccess('getAppVersionList', '앱 버전 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return this.appVersionAdminPresentationService.toPaginationResponse(items, page, limit, totalItems);
        } catch (error) {
            this.logger.logError('getAppVersionList', '앱 버전 목록 조회', error);
            throw new BadRequestException('앱 버전 목록 조회에 실패했습니다.');
        }
    }
}
