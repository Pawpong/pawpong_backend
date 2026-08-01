import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterProfileController } from '../controller/adopter-profile.controller';
import { GetAdopterProfileUseCase } from '../application/use-cases/get-adopter-profile.use-case';
import { UpdateAdopterProfileUseCase } from '../application/use-cases/update-adopter-profile.use-case';
import { AdopterProfileResultMapperService } from '../domain/services/adopter-profile-result-mapper.service';
import { AdopterProfileUpdateMapperService } from '../domain/services/adopter-profile-update-mapper.service';

// 입양자 > 프로필 슬라이스 (내 프로필 조회·수정)
export const ADOPTER_PROFILE_MODULE_IMPORTS = [AdopterSharedModule];

export const ADOPTER_PROFILE_MODULE_CONTROLLERS = [AdopterProfileController];

export const ADOPTER_PROFILE_MODULE_PROVIDERS = [
    GetAdopterProfileUseCase,
    UpdateAdopterProfileUseCase,
    AdopterProfileResultMapperService,
    AdopterProfileUpdateMapperService,
];
