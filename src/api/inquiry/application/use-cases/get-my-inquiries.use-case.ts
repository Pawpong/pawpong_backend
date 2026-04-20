import { Inject, Injectable } from '@nestjs/common';

import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_ASSET_URL_PORT, type InquiryAssetUrlPort } from '../ports/inquiry-asset-url.port';
import { INQUIRY_READER_PORT, type InquiryAnimalType, type InquiryReaderPort } from '../ports/inquiry-reader.port';
import type { InquiryListResult } from '../types/inquiry-result.type';

@Injectable()
export class GetMyInquiriesUseCase {
    constructor(
        @Inject(INQUIRY_READER_PORT)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        @Inject(INQUIRY_ASSET_URL_PORT)
        private readonly inquiryAssetUrl: InquiryAssetUrlPort,
    ) {}

    async execute(
        userId: string,
        page: number = 1,
        limit: number = 15,
        animalType?: InquiryAnimalType,
    ): Promise<InquiryListResult> {
        const skip = (page - 1) * limit;
        const inquiries = await this.inquiryReader.readMyList({
            authorId: userId,
            animalType,
            skip,
            limit: limit + 1,
        });

        return this.inquiryViewService.buildListResponse(inquiries, limit, (fileName, expirationMinutes) =>
            this.inquiryAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
