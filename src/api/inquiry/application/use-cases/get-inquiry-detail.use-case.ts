import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { InquiryDetailResponseDto } from '../../dto/response/inquiry-detail-response.dto';
import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_READER, type InquiryReaderPort } from '../ports/inquiry-reader.port';

@Injectable()
export class GetInquiryDetailUseCase {
    constructor(
        @Inject(INQUIRY_READER)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        private readonly storageService: StorageService,
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
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
