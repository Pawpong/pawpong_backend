import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../../common/storage/storage.module';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../../../schema/adopter.schema';
import { ParentPet, ParentPetSchema } from '../../../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../../../schema/available-pet.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../../schema/adoption-application.schema';
import { BreederReview, BreederReviewSchema } from '../../../../schema/breeder-review.schema';

import { BreederManagementFileUrlAdapter } from '../infrastructure/breeder-management-file-url.adapter';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../application/ports/breeder-management-file-url.port';
import { BreederManagementListReaderAdapter } from '../infrastructure/breeder-management-list-reader.adapter';
import { BREEDER_MANAGEMENT_LIST_READER_PORT } from '../application/ports/breeder-management-list-reader.port';
import { BreederManagementSettingsAdapter } from '../infrastructure/breeder-management-settings.adapter';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../application/ports/breeder-management-settings.port';
import { BreederManagementPaginationAssemblerService } from '../domain/services/breeder-management-pagination-assembler.service';
import { BreederRepository } from '../repository/breeder.repository';
import { ParentPetRepository } from '../repository/parent-pet.repository';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederManagementAdopterRepository } from '../repository/breeder-management-adopter.repository';
import { BreederManagementBreederReviewRepository } from '../repository/breeder-review.repository';

// 브리더 관리 도메인의 여러 슬라이스가 공유하는 공통 기반.
// - 코어 리포지토리(모든 기능이 접근하는 영속성 계층)
// - 파일키 → CDN URL 변환(FILE_URL_PORT)
// - 목록 페이지네이션 조립(applications/pets/reviews 공용)
const BREEDER_MANAGEMENT_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
    { name: BreederReview.name, schema: BreederReviewSchema },
]);

export const BREEDER_MANAGEMENT_SHARED_MODULE_IMPORTS = [BREEDER_MANAGEMENT_SHARED_SCHEMA_IMPORTS, StorageModule];

const BREEDER_MANAGEMENT_SHARED_REPOSITORY_PROVIDERS = [
    BreederRepository,
    ParentPetRepository,
    AdoptionApplicationRepository,
    AvailablePetManagementRepository,
    BreederManagementAdopterRepository,
    BreederManagementBreederReviewRepository,
];

export const BREEDER_MANAGEMENT_SHARED_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_SHARED_REPOSITORY_PROVIDERS,
    BreederManagementPaginationAssemblerService,
    BreederManagementFileUrlAdapter,
    BreederManagementListReaderAdapter,
    BreederManagementSettingsAdapter,
    {
        provide: BREEDER_MANAGEMENT_FILE_URL_PORT,
        useExisting: BreederManagementFileUrlAdapter,
    },
    {
        // 목록 read model — pets/reviews/applications 슬라이스가 공용으로 조회
        provide: BREEDER_MANAGEMENT_LIST_READER_PORT,
        useExisting: BreederManagementListReaderAdapter,
    },
    {
        // 브리더 설정 조회 — verification/applications 슬라이스가 공용으로 사용
        provide: BREEDER_MANAGEMENT_SETTINGS_PORT,
        useExisting: BreederManagementSettingsAdapter,
    },
];

export const BREEDER_MANAGEMENT_SHARED_MODULE_EXPORTS = [
    ...BREEDER_MANAGEMENT_SHARED_REPOSITORY_PROVIDERS,
    BreederManagementPaginationAssemblerService,
    BREEDER_MANAGEMENT_FILE_URL_PORT,
    BREEDER_MANAGEMENT_LIST_READER_PORT,
    BREEDER_MANAGEMENT_SETTINGS_PORT,
];
