import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementReviewsQueryController } from '../controller/breeder-management-reviews-query.controller';
import { BreederManagementReviewReplyController } from '../controller/breeder-management-review-reply.controller';
import { GetBreederManagementMyReviewsUseCase } from '../application/use-cases/get-breeder-management-my-reviews.use-case';
import { AddBreederManagementReviewReplyUseCase } from '../application/use-cases/add-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from '../application/use-cases/update-breeder-management-review-reply.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from '../application/use-cases/remove-breeder-management-review-reply.use-case';
import { BreederManagementMyReviewMapperService } from '../domain/services/breeder-management-my-review-mapper.service';
import { BreederManagementReviewReplyResultMapperService } from '../domain/services/breeder-management-review-reply-result-mapper.service';
import { BreederManagementReviewReplyAdapter } from '../infrastructure/breeder-management-review-reply.adapter';
import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from '../application/ports/breeder-management-review-reply.port';

// 브리더 관리 > 후기 슬라이스
// 내 후기 목록(LIST_READER_PORT·pagination)은 shared 에서 주입받고, 답글 쓰기는 자체 Port 로 처리한다.
export const BREEDER_MANAGEMENT_REVIEWS_MODULE_IMPORTS = [BreederManagementSharedModule];

export const BREEDER_MANAGEMENT_REVIEWS_MODULE_CONTROLLERS = [
    BreederManagementReviewsQueryController,
    BreederManagementReviewReplyController,
];

export const BREEDER_MANAGEMENT_REVIEWS_MODULE_PROVIDERS = [
    GetBreederManagementMyReviewsUseCase,
    AddBreederManagementReviewReplyUseCase,
    UpdateBreederManagementReviewReplyUseCase,
    RemoveBreederManagementReviewReplyUseCase,
    BreederManagementMyReviewMapperService,
    BreederManagementReviewReplyResultMapperService,
    BreederManagementReviewReplyAdapter,
    {
        provide: BREEDER_MANAGEMENT_REVIEW_REPLY_PORT,
        useExisting: BreederManagementReviewReplyAdapter,
    },
];
