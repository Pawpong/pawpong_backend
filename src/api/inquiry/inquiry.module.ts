import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InquiryController } from './inquiry.controller';

import { InquiryService } from './inquiry.service';

import { InquiryRepository } from './inquiry.repository';

import { Inquiry, InquirySchema } from '../../schema/inquiry.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

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
    providers: [InquiryService, InquiryRepository, CustomLoggerService],
    exports: [InquiryService],
})
export class InquiryModule {}
