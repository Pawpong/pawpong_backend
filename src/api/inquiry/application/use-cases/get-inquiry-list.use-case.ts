import { Inject, Injectable } from '@nestjs/common';

import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_ASSET_URL, type InquiryAssetUrlPort } from '../ports/inquiry-asset-url.port';
import { INQUIRY_READER, type InquiryAnimalType, type InquiryReaderPort } from '../ports/inquiry-reader.port';
import type { InquiryListResult } from '../types/inquiry-result.type';

@Injectable()
export class GetInquiryListUseCase {
    constructor(
        @Inject(INQUIRY_READER)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        @Inject(INQUIRY_ASSET_URL)
        private readonly inquiryAssetUrl: InquiryAssetUrlPort,
    ) {}

    async execute(
        page: number = 1,
        limit: number = 15,
        animalType?: InquiryAnimalType,
        sort: string = 'latest_answer',
    ): Promise<InquiryListResult> {
        const skip = (page - 1) * limit;
        const inquiries = await this.inquiryReader.readPublicList({
            animalType,
            sort,
            skip,
            limit: limit + 1,
        });

        return this.inquiryViewService.buildListResponse(inquiries, limit, (fileName, expirationMinutes) =>
            this.inquiryAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
