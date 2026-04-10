import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InquiryAdopterCommandController } from './inquiry-adopter-command.controller';
import { InquiryAdopterQueryController } from './inquiry-adopter-query.controller';
import { InquiryBreederAnswerController } from './inquiry-breeder-answer.controller';
import { InquiryBreederQueryController } from './inquiry-breeder-query.controller';
import { InquiryPublicDetailController } from './inquiry-public-detail.controller';
import { InquiryPublicListController } from './inquiry-public-list.controller';

import { InquiryRepository } from './repository/inquiry.repository';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { INQUIRY_ASSET_URL } from './application/ports/inquiry-asset-url.port';
import { InquiryCommandPolicyService } from './domain/services/inquiry-command-policy.service';
import { InquiryAdopterDeleteResponseMessageService } from './domain/services/inquiry-adopter-delete-response-message.service';
import { InquiryAdopterQueryResponseMessageService } from './domain/services/inquiry-adopter-query-response-message.service';
import { InquiryBreederAnswerResponseMessageService } from './domain/services/inquiry-breeder-answer-response-message.service';
import { InquiryBreederQueryResponseMessageService } from './domain/services/inquiry-breeder-query-response-message.service';
import { InquiryPublicQueryResponseMessageService } from './domain/services/inquiry-public-query-response-message.service';
import { InquiryAdopterWriteResponseMessageService } from './domain/services/inquiry-adopter-write-response-message.service';
import { InquiryViewService } from './domain/services/inquiry-view.service';
import { INQUIRY_COMMAND } from './application/ports/inquiry-command.port';
import { InquiryRepositoryCommandAdapter } from './infrastructure/inquiry-repository-command.adapter';
import { InquiryRepositoryReaderAdapter } from './infrastructure/inquiry-repository-reader.adapter';
import { InquiryStorageAssetUrlAdapter } from './infrastructure/inquiry-storage-asset-url.adapter';
import { INQUIRY_READER } from './application/ports/inquiry-reader.port';

import { Inquiry, InquirySchema } from '../../schema/inquiry.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';

import { StorageModule } from '../../common/storage/storage.module';

/**
 * 문의 모듈
 * 입양자 질문 작성, 브리더 답변, 목록/상세 조회 기능 제공
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Inquiry.name, schema: InquirySchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
        ]),
        StorageModule,
    ],
    controllers: [
        InquiryAdopterQueryController,
        InquiryAdopterCommandController,
        InquiryBreederQueryController,
        InquiryBreederAnswerController,
        InquiryPublicListController,
        InquiryPublicDetailController,
    ],
    providers: [
        InquiryRepository,
        GetInquiryListUseCase,
        GetInquiryDetailUseCase,
        GetMyInquiriesUseCase,
        GetBreederInquiriesUseCase,
        CreateInquiryUseCase,
        UpdateInquiryUseCase,
        DeleteInquiryUseCase,
        CreateInquiryAnswerUseCase,
        InquiryCommandPolicyService,
        InquiryPublicQueryResponseMessageService,
        InquiryAdopterQueryResponseMessageService,
        InquiryBreederQueryResponseMessageService,
        InquiryAdopterWriteResponseMessageService,
        InquiryAdopterDeleteResponseMessageService,
        InquiryBreederAnswerResponseMessageService,
        InquiryViewService,
        InquiryRepositoryReaderAdapter,
        InquiryRepositoryCommandAdapter,
        InquiryStorageAssetUrlAdapter,
        {
            provide: INQUIRY_READER,
            useExisting: InquiryRepositoryReaderAdapter,
        },
        {
            provide: INQUIRY_COMMAND,
            useExisting: InquiryRepositoryCommandAdapter,
        },
        {
            provide: INQUIRY_ASSET_URL,
            useExisting: InquiryStorageAssetUrlAdapter,
        },
    ],
})
export class InquiryModule {}
