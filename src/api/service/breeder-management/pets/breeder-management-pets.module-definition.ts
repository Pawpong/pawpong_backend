import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementProfileModule } from '../profile/breeder-management-profile.module';
import { BreederManagementParentPetsController } from '../controller/breeder-management-parent-pets.controller';
import { AddBreederManagementParentPetUseCase } from '../application/use-cases/add-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from '../application/use-cases/update-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from '../application/use-cases/remove-breeder-management-parent-pet.use-case';
import { BreederManagementParentPetCommandMapperService } from '../domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementParentPetCommandResultMapperService } from '../domain/services/breeder-management-parent-pet-command-result-mapper.service';
import { BreederManagementPetCommandAdapter } from '../infrastructure/breeder-management-pet-command.adapter';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../application/ports/breeder-management-pet-command.port';

// 브리더 관리 > 부모 동물 슬라이스
// PROFILE_PORT(소유권 검증)는 profile 슬라이스에서, LIST_READER_PORT·pagination 은 shared 에서 주입받는다.
// 분양 가능 동물(available-pet) CRUD·my-pets 조회는 breeder-pet-posting 도메인으로 이관되어 이 슬라이스에서는 제거됨.
// BreederManagementPetCommandAdapter/AvailablePetManagementRepository 는 parent-pet 경로와 프로필/대시보드
// 통계 조회(list-reader, profile adapter)에서 여전히 공유하므로 유지한다.
export const BREEDER_MANAGEMENT_PETS_MODULE_IMPORTS = [BreederManagementSharedModule, BreederManagementProfileModule];

export const BREEDER_MANAGEMENT_PETS_MODULE_CONTROLLERS = [BreederManagementParentPetsController];

const BREEDER_MANAGEMENT_PETS_USE_CASE_PROVIDERS = [
    AddBreederManagementParentPetUseCase,
    UpdateBreederManagementParentPetUseCase,
    RemoveBreederManagementParentPetUseCase,
];

const BREEDER_MANAGEMENT_PETS_DOMAIN_PROVIDERS = [
    BreederManagementParentPetCommandMapperService,
    BreederManagementParentPetCommandResultMapperService,
];

export const BREEDER_MANAGEMENT_PETS_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_PETS_USE_CASE_PROVIDERS,
    ...BREEDER_MANAGEMENT_PETS_DOMAIN_PROVIDERS,
    BreederManagementPetCommandAdapter,
    {
        provide: BREEDER_MANAGEMENT_PET_COMMAND_PORT,
        useExisting: BreederManagementPetCommandAdapter,
    },
];
