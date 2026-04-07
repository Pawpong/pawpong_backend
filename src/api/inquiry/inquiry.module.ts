import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InquiryController } from './inquiry.controller';

import { InquiryRepository } from './inquiry.repository';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { InquiryCommandPolicyService } from './domain/services/inquiry-command-policy.service';
import { InquiryViewService } from './domain/services/inquiry-view.service';
import { INQUIRY_COMMAND } from './application/ports/inquiry-command.port';
import { InquiryRepositoryCommandAdapter } from './infrastructure/inquiry-repository-command.adapter';
import { InquiryRepositoryReaderAdapter } from './infrastructure/inquiry-repository-reader.adapter';
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
    controllers: [InquiryController],
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
        InquiryViewService,
        InquiryRepositoryReaderAdapter,
        InquiryRepositoryCommandAdapter,
        {
            provide: INQUIRY_READER,
            useExisting: InquiryRepositoryReaderAdapter,
        },
        {
            provide: INQUIRY_COMMAND,
            useExisting: InquiryRepositoryCommandAdapter,
        },
    ],
})
export class InquiryModule {}
