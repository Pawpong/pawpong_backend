import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementProfileInfoController } from '../controller/breeder-management-profile-info.controller';
import { BreederManagementDashboardController } from '../controller/breeder-management-dashboard.controller';
import { GetBreederManagementProfileUseCase } from '../application/use-cases/get-breeder-management-profile.use-case';
import { UpdateBreederManagementProfileUseCase } from '../application/use-cases/update-breeder-management-profile.use-case';
import { GetBreederManagementDashboardUseCase } from '../application/use-cases/get-breeder-management-dashboard.use-case';
import { BreederManagementProfileAssemblerService } from '../domain/services/breeder-management-profile-assembler.service';
import { BreederManagementProfileUpdateMapperService } from '../domain/services/breeder-management-profile-update-mapper.service';
import { BreederManagementProfileCommandResultMapperService } from '../domain/services/breeder-management-profile-command-result-mapper.service';
import { BreederManagementDashboardAssemblerService } from '../domain/services/breeder-management-dashboard-assembler.service';
import { BreederManagementProfileAdapter } from '../infrastructure/breeder-management-profile.adapter';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../application/ports/breeder-management-profile.port';

// 브리더 관리 > 프로필/대시보드 슬라이스
// PROFILE_PORT 는 pets/applications/verification 슬라이스도 사용하므로 이 슬라이스가 소유하고 Port 로만 노출한다.
export const BREEDER_MANAGEMENT_PROFILE_MODULE_IMPORTS = [BreederManagementSharedModule];

export const BREEDER_MANAGEMENT_PROFILE_MODULE_CONTROLLERS = [
    BreederManagementProfileInfoController,
    BreederManagementDashboardController,
];

export const BREEDER_MANAGEMENT_PROFILE_MODULE_PROVIDERS = [
    GetBreederManagementProfileUseCase,
    UpdateBreederManagementProfileUseCase,
    GetBreederManagementDashboardUseCase,
    BreederManagementProfileAssemblerService,
    BreederManagementProfileUpdateMapperService,
    BreederManagementProfileCommandResultMapperService,
    BreederManagementDashboardAssemblerService,
    BreederManagementProfileAdapter,
    {
        provide: BREEDER_MANAGEMENT_PROFILE_PORT,
        useExisting: BreederManagementProfileAdapter,
    },
];

export const BREEDER_MANAGEMENT_PROFILE_MODULE_EXPORTS = [BREEDER_MANAGEMENT_PROFILE_PORT];
