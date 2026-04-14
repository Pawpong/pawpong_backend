import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Inquiry, InquirySchema } from '../../schema/inquiry.schema';
import { StorageModule } from '../../common/storage/storage.module';

import { INQUIRY_ASSET_URL_PORT } from './application/ports/inquiry-asset-url.port';
import { INQUIRY_COMMAND_PORT } from './application/ports/inquiry-command.port';
import { INQUIRY_READER_PORT } from './application/ports/inquiry-reader.port';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { InquiryAdopterCommandController } from './inquiry-adopter-command.controller';
import { InquiryAdopterQueryController } from './inquiry-adopter-query.controller';
import { InquiryBreederAnswerController } from './inquiry-breeder-answer.controller';
import { InquiryBreederQueryController } from './inquiry-breeder-query.controller';
import { InquiryPublicDetailController } from './inquiry-public-detail.controller';
import { InquiryPublicListController } from './inquiry-public-list.controller';
import { InquiryCommandPolicyService } from './domain/services/inquiry-command-policy.service';
import { InquiryViewService } from './domain/services/inquiry-view.service';
import { InquiryRepositoryCommandAdapter } from './infrastructure/inquiry-repository-command.adapter';
import { InquiryRepositoryReaderAdapter } from './infrastructure/inquiry-repository-reader.adapter';
import { InquiryStorageAssetUrlAdapter } from './infrastructure/inquiry-storage-asset-url.adapter';
import { InquiryRepository } from './repository/inquiry.repository';

const INQUIRY_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Inquiry.name, schema: InquirySchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const INQUIRY_MODULE_IMPORTS = [INQUIRY_SCHEMA_IMPORTS, StorageModule];

export const INQUIRY_MODULE_CONTROLLERS = [
    InquiryAdopterQueryController,
    InquiryAdopterCommandController,
    InquiryBreederQueryController,
    InquiryBreederAnswerController,
    InquiryPublicListController,
    InquiryPublicDetailController,
];

const INQUIRY_USE_CASE_PROVIDERS = [
    GetInquiryListUseCase,
    GetInquiryDetailUseCase,
    GetMyInquiriesUseCase,
    GetBreederInquiriesUseCase,
    CreateInquiryUseCase,
    UpdateInquiryUseCase,
    DeleteInquiryUseCase,
    CreateInquiryAnswerUseCase,
];

const INQUIRY_DOMAIN_PROVIDERS = [InquiryCommandPolicyService, InquiryViewService];

const INQUIRY_INFRASTRUCTURE_PROVIDERS = [
    InquiryRepository,
    InquiryRepositoryReaderAdapter,
    InquiryRepositoryCommandAdapter,
    InquiryStorageAssetUrlAdapter,
];

const INQUIRY_PORT_BINDINGS = [
    {
        provide: INQUIRY_READER_PORT,
        useExisting: InquiryRepositoryReaderAdapter,
    },
    {
        provide: INQUIRY_COMMAND_PORT,
        useExisting: InquiryRepositoryCommandAdapter,
    },
    {
        provide: INQUIRY_ASSET_URL_PORT,
        useExisting: InquiryStorageAssetUrlAdapter,
    },
];

export const INQUIRY_MODULE_PROVIDERS = [
    ...INQUIRY_USE_CASE_PROVIDERS,
    ...INQUIRY_DOMAIN_PROVIDERS,
    ...INQUIRY_INFRASTRUCTURE_PROVIDERS,
    ...INQUIRY_PORT_BINDINGS,
];
