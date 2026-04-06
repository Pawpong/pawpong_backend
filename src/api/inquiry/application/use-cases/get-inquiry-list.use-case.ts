import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { InquiryListResponseDto } from '../../dto/response/inquiry-list-response.dto';
import { InquiryViewService } from '../../domain/services/inquiry-view.service';
import { INQUIRY_READER, type InquiryAnimalType, type InquiryReaderPort } from '../ports/inquiry-reader.port';

@Injectable()
export class GetInquiryListUseCase {
    constructor(
        @Inject(INQUIRY_READER)
        private readonly inquiryReader: InquiryReaderPort,
        private readonly inquiryViewService: InquiryViewService,
        private readonly storageService: StorageService,
    ) {}

    async execute(
        page: number = 1,
        limit: number = 15,
        animalType?: InquiryAnimalType,
        sort: string = 'latest_answer',
    ): Promise<InquiryListResponseDto> {
        const skip = (page - 1) * limit;
        const inquiries = await this.inquiryReader.readPublicList({
            animalType,
            sort,
            skip,
            limit: limit + 1,
        });

        return this.inquiryViewService.buildListResponse(inquiries, limit, (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
