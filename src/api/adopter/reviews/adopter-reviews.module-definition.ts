import { MongooseModule } from '@nestjs/mongoose';

import { MailModule } from '../../../common/mail/mail.module';
import { StorageModule } from '../../../common/storage/storage.module';
import { BreederReview, BreederReviewSchema } from '../../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';

import { NotificationModule } from '../../notification/notification.module';
import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterReviewCommandController } from '../controller/adopter-review-command.controller';
import { AdopterReviewQueryController } from '../controller/adopter-review-query.controller';
import { CreateAdopterReviewUseCase } from '../application/use-cases/create-adopter-review.use-case';
import { ReportAdopterReviewUseCase } from '../application/use-cases/report-adopter-review.use-case';
import { GetAdopterReviewsUseCase } from '../application/use-cases/get-adopter-reviews.use-case';
import { GetAdopterReviewDetailUseCase } from '../application/use-cases/get-adopter-review-detail.use-case';
import { AdopterReviewPageAssemblerService } from '../domain/services/adopter-review-page-assembler.service';
import { AdopterReviewDetailMapperService } from '../domain/services/adopter-review-detail-mapper.service';
import { AdopterReviewRepository } from '../repository/adopter-review.repository';
import { AdopterReviewCommandAdapter } from '../infrastructure/adopter-review-command.adapter';
import { AdopterReviewReaderAdapter } from '../infrastructure/adopter-review-reader.adapter';
import { AdopterReviewNotifierAdapter } from '../infrastructure/adopter-review-notifier.adapter';
import { ADOPTER_REVIEW_COMMAND_PORT } from '../application/ports/adopter-review-command.port';
import { ADOPTER_REVIEW_READER_PORT } from '../application/ports/adopter-review-reader.port';
import { ADOPTER_REVIEW_NOTIFIER_PORT } from '../application/ports/adopter-review-notifier.port';

// 입양자 > 후기 슬라이스 (작성·신고·조회)
const ADOPTER_REVIEWS_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: BreederReview.name, schema: BreederReviewSchema },
    // 후기 작성 자격(입양 완료 여부) 확인에 신청 내역이 필요
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
]);

export const ADOPTER_REVIEWS_MODULE_IMPORTS = [
    ADOPTER_REVIEWS_SCHEMA_IMPORTS,
    AdopterSharedModule,
    StorageModule,
    MailModule,
    NotificationModule,
];

export const ADOPTER_REVIEWS_MODULE_CONTROLLERS = [AdopterReviewCommandController, AdopterReviewQueryController];

export const ADOPTER_REVIEWS_MODULE_PROVIDERS = [
    CreateAdopterReviewUseCase,
    ReportAdopterReviewUseCase,
    GetAdopterReviewsUseCase,
    GetAdopterReviewDetailUseCase,
    AdopterReviewPageAssemblerService,
    AdopterReviewDetailMapperService,
    AdopterReviewRepository,
    AdopterReviewCommandAdapter,
    AdopterReviewReaderAdapter,
    AdopterReviewNotifierAdapter,
    {
        provide: ADOPTER_REVIEW_COMMAND_PORT,
        useExisting: AdopterReviewCommandAdapter,
    },
    {
        provide: ADOPTER_REVIEW_READER_PORT,
        useExisting: AdopterReviewReaderAdapter,
    },
    {
        provide: ADOPTER_REVIEW_NOTIFIER_PORT,
        useExisting: AdopterReviewNotifierAdapter,
    },
];
