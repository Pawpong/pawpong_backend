import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementProfileModule } from '../profile/breeder-management-profile.module';
import { BreederManagementParentPetsController } from '../controller/breeder-management-parent-pets.controller';
import { BreederManagementAvailablePetsController } from '../controller/breeder-management-available-pets.controller';
import { BreederManagementMyPetsController } from '../controller/breeder-management-my-pets.controller';
import { AddBreederManagementParentPetUseCase } from '../application/use-cases/add-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from '../application/use-cases/update-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from '../application/use-cases/remove-breeder-management-parent-pet.use-case';
import { AddBreederManagementAvailablePetUseCase } from '../application/use-cases/add-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from '../application/use-cases/update-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from '../application/use-cases/update-breeder-management-available-pet-status.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from '../application/use-cases/remove-breeder-management-available-pet.use-case';
import { GetBreederManagementMyPetsUseCase } from '../application/use-cases/get-breeder-management-my-pets.use-case';
import { BreederManagementParentPetCommandMapperService } from '../domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementParentPetCommandResultMapperService } from '../domain/services/breeder-management-parent-pet-command-result-mapper.service';
import { BreederManagementAvailablePetCommandMapperService } from '../domain/services/breeder-management-available-pet-command-mapper.service';
import { BreederManagementAvailablePetCommandResultMapperService } from '../domain/services/breeder-management-available-pet-command-result-mapper.service';
import { BreederManagementAvailablePetStatusResultMapperService } from '../domain/services/breeder-management-available-pet-status-result-mapper.service';
import { BreederManagementMyPetMapperService } from '../domain/services/breeder-management-my-pet-mapper.service';
import { BreederManagementPetCommandAdapter } from '../infrastructure/breeder-management-pet-command.adapter';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../application/ports/breeder-management-pet-command.port';

// 브리더 관리 > 부모 동물 / 분양 가능 동물 슬라이스
// PROFILE_PORT(소유권 검증)는 profile 슬라이스에서, LIST_READER_PORT·pagination 은 shared 에서 주입받는다.
export const BREEDER_MANAGEMENT_PETS_MODULE_IMPORTS = [
    BreederManagementSharedModule,
    BreederManagementProfileModule,
];

export const BREEDER_MANAGEMENT_PETS_MODULE_CONTROLLERS = [
    BreederManagementParentPetsController,
    BreederManagementAvailablePetsController,
    BreederManagementMyPetsController,
];

const BREEDER_MANAGEMENT_PETS_USE_CASE_PROVIDERS = [
    AddBreederManagementParentPetUseCase,
    UpdateBreederManagementParentPetUseCase,
    RemoveBreederManagementParentPetUseCase,
    AddBreederManagementAvailablePetUseCase,
    UpdateBreederManagementAvailablePetUseCase,
    UpdateBreederManagementAvailablePetStatusUseCase,
    RemoveBreederManagementAvailablePetUseCase,
    GetBreederManagementMyPetsUseCase,
];

const BREEDER_MANAGEMENT_PETS_DOMAIN_PROVIDERS = [
    BreederManagementParentPetCommandMapperService,
    BreederManagementParentPetCommandResultMapperService,
    BreederManagementAvailablePetCommandMapperService,
    BreederManagementAvailablePetCommandResultMapperService,
    BreederManagementAvailablePetStatusResultMapperService,
    BreederManagementMyPetMapperService,
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
