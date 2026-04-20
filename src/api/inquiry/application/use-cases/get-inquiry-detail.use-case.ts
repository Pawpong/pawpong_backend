import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';
import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_ASSET_URL_PORT, type InquiryAssetUrlPort } from '../ports/inquiry-asset-url.port';
import { INQUIRY_READER_PORT, type InquiryReaderPort } from '../ports/inquiry-reader.port';
import type { InquiryDetailResult } from '../types/inquiry-result.type';

@Injectable()
export class GetInquiryDetailUseCase {
    constructor(
        @Inject(INQUIRY_READER_PORT)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        @Inject(INQUIRY_ASSET_URL_PORT)
        private readonly inquiryAssetUrl: InquiryAssetUrlPort,
    ) {}

    async execute(inquiryId: string, userId?: string): Promise<InquiryDetailResult> {
        if (!inquiryId) {
            throw new DomainValidationError('문의 ID가 필요합니다.');
        }

        const inquiry = await this.inquiryReader.readDetail(inquiryId);
        if (!inquiry) {
            throw new DomainNotFoundError('해당 문의를 찾을 수 없습니다.');
        }

        this.inquiryViewService.ensureReadableByUser(inquiry, userId);
        this.inquiryReader.incrementViewCount(inquiryId);

        return this.inquiryViewService.buildDetailResponse(inquiry, userId, (fileName, expirationMinutes) =>
            this.inquiryAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
