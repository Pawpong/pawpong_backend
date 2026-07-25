import { BreederSharedModule } from '../shared/breeder-shared.module';
import { BreederApplicationFormController, BreederProfileController } from '../controller/breeder-profile.controller';
import { BreederPetDetailController, BreederPetsController } from '../controller/breeder-pets.controller';
import { BreederReviewsController } from '../controller/breeder-reviews.controller';
import { GetBreederProfileUseCase } from '../application/use-cases/get-breeder-profile.use-case';
import { GetBreederApplicationFormUseCase } from '../application/use-cases/get-breeder-application-form.use-case';
import { GetBreederPetsUseCase } from '../application/use-cases/get-breeder-pets.use-case';
import { GetBreederPetDetailUseCase } from '../application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederParentPetsUseCase } from '../application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederReviewsUseCase } from '../application/use-cases/get-breeder-reviews.use-case';
import { BreederPublicProfileAssemblerService } from '../domain/services/breeder-public-profile-assembler.service';
import { BreederPublicApplicationFormBuilderService } from '../domain/services/breeder-public-application-form-builder.service';
import { BreederPublicPetPageAssemblerService } from '../domain/services/breeder-public-pet-page-assembler.service';
import { BreederPublicPetDetailAssemblerService } from '../domain/services/breeder-public-pet-detail-assembler.service';
import { BreederPublicParentPetListAssemblerService } from '../domain/services/breeder-public-parent-pet-list-assembler.service';
import { BreederPublicReviewPageAssemblerService } from '../domain/services/breeder-public-review-page-assembler.service';

// 브리더 > 상세 슬라이스 (브리더홈: 프로필 · 신청서 양식 · 보유 동물 · 후기)
export const BREEDER_DETAIL_MODULE_IMPORTS = [BreederSharedModule];

export const BREEDER_DETAIL_MODULE_CONTROLLERS = [
    BreederProfileController,
    BreederApplicationFormController,
    BreederPetsController,
    BreederPetDetailController,
    BreederReviewsController,
];

export const BREEDER_DETAIL_MODULE_PROVIDERS = [
    GetBreederProfileUseCase,
    GetBreederApplicationFormUseCase,
    GetBreederPetsUseCase,
    GetBreederPetDetailUseCase,
    GetBreederParentPetsUseCase,
    GetBreederReviewsUseCase,
    BreederPublicProfileAssemblerService,
    BreederPublicApplicationFormBuilderService,
    BreederPublicPetPageAssemblerService,
    BreederPublicPetDetailAssemblerService,
    BreederPublicParentPetListAssemblerService,
    BreederPublicReviewPageAssemblerService,
];
