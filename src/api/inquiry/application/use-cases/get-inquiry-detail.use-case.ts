import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { InquiryDetailResponseDto } from '../../dto/response/inquiry-detail-response.dto';
import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_ASSET_URL, type InquiryAssetUrlPort } from '../ports/inquiry-asset-url.port';
import { INQUIRY_READER, type InquiryReaderPort } from '../ports/inquiry-reader.port';

@Injectable()
export class GetInquiryDetailUseCase {
    constructor(
        @Inject(INQUIRY_READER)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        @Inject(INQUIRY_ASSET_URL)
        private readonly inquiryAssetUrl: InquiryAssetUrlPort,
    ) {}

    async execute(inquiryId: string, userId?: string): Promise<InquiryDetailResponseDto> {
        if (!inquiryId) {
            throw new BadRequestException('문의 ID가 필요합니다.');
        }

        const inquiry = await this.inquiryReader.readDetail(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        this.inquiryViewService.ensureReadableByUser(inquiry, userId);
        this.inquiryReader.incrementViewCount(inquiryId);

        return this.inquiryViewService.buildDetailResponse(inquiry, userId, (fileName, expirationMinutes) =>
            this.inquiryAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
