import { Inject, Injectable } from '@nestjs/common';

import { InquiryListResponseDto } from '../../dto/response/inquiry-list-response.dto';
import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_ASSET_URL, type InquiryAssetUrlPort } from '../ports/inquiry-asset-url.port';
import { INQUIRY_READER, type InquiryReaderPort } from '../ports/inquiry-reader.port';

@Injectable()
export class GetBreederInquiriesUseCase {
    constructor(
        @Inject(INQUIRY_READER)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        @Inject(INQUIRY_ASSET_URL)
        private readonly inquiryAssetUrl: InquiryAssetUrlPort,
    ) {}

    async execute(
        breederId: string,
        answered: boolean,
        page: number = 1,
        limit: number = 15,
    ): Promise<InquiryListResponseDto> {
        const skip = (page - 1) * limit;
        const inquiries = await this.inquiryReader.readBreederList({
            breederId,
            answered,
            skip,
            limit: limit + 1,
        });

        return this.inquiryViewService.buildListResponse(inquiries, limit, (fileName, expirationMinutes) =>
            this.inquiryAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
