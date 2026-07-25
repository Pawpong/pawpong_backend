import { MongooseModule } from '@nestjs/mongoose';

import { AuthBanner, AuthBannerSchema } from '../../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../../schema/counsel-banner.schema';
import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';

import { BreederManagementAdminProfileBannersController } from './controller/breeder-management-admin-profile-banners.controller';
import { BreederManagementAdminCounselBannersController } from './controller/breeder-management-admin-counsel-banners.controller';
import { BreederManagementAdminPublicBannersController } from './controller/breeder-management-admin-public-banners.controller';
import { GetAllProfileBannersUseCase } from './application/use-cases/get-all-profile-banners.use-case';
import { GetActiveProfileBannersUseCase } from './application/use-cases/get-active-profile-banners.use-case';
import { CreateProfileBannerUseCase } from './application/use-cases/create-profile-banner.use-case';
import { UpdateProfileBannerUseCase } from './application/use-cases/update-profile-banner.use-case';
import { DeleteProfileBannerUseCase } from './application/use-cases/delete-profile-banner.use-case';
import { GetAllCounselBannersUseCase } from './application/use-cases/get-all-counsel-banners.use-case';
import { GetActiveCounselBannersUseCase } from './application/use-cases/get-active-counsel-banners.use-case';
import { CreateCounselBannerUseCase } from './application/use-cases/create-counsel-banner.use-case';
import { UpdateCounselBannerUseCase } from './application/use-cases/update-counsel-banner.use-case';
import { DeleteCounselBannerUseCase } from './application/use-cases/delete-counsel-banner.use-case';
import { BreederManagementBannerResultMapperService } from './domain/services/breeder-management-banner-result-mapper.service';
import { BreederManagementAdminBannerReaderAdapter } from './infrastructure/breeder-management-admin-banner-reader.adapter';
import { BreederManagementAdminBannerWriterAdapter } from './infrastructure/breeder-management-admin-banner-writer.adapter';
import { BreederManagementAdminBannerRepository } from './repository/breeder-management-admin-banner.repository';
import { BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT } from './application/ports/breeder-management-admin-banner-reader.port';
import { BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT } from './application/ports/breeder-management-admin-banner-writer.port';
import {
    GET_ACTIVE_COUNSEL_BANNERS_QUERY,
    GET_ACTIVE_PROFILE_BANNERS_QUERY,
} from './application/tokens/breeder-management-public-banner-query.token';

// 브리더 관리 > 관리자 배너 슬라이스 전용 스키마 (프로필/상담 배너)
const BREEDER_MANAGEMENT_ADMIN_BANNER_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AuthBanner.name, schema: AuthBannerSchema },
    { name: CounselBanner.name, schema: CounselBannerSchema },
]);

export const BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_IMPORTS = [
    BREEDER_MANAGEMENT_ADMIN_BANNER_SCHEMA_IMPORTS,
    // 배너 결과 매퍼가 FILE_URL_PORT(파일키 → CDN URL) 를 필요로 함
    BreederManagementSharedModule,
];

export const BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_CONTROLLERS = [
    BreederManagementAdminProfileBannersController,
    BreederManagementAdminCounselBannersController,
    BreederManagementAdminPublicBannersController,
];

const BREEDER_MANAGEMENT_ADMIN_BANNER_USE_CASE_PROVIDERS = [
    GetAllProfileBannersUseCase,
    GetActiveProfileBannersUseCase,
    CreateProfileBannerUseCase,
    UpdateProfileBannerUseCase,
    DeleteProfileBannerUseCase,
    GetAllCounselBannersUseCase,
    GetActiveCounselBannersUseCase,
    CreateCounselBannerUseCase,
    UpdateCounselBannerUseCase,
    DeleteCounselBannerUseCase,
];

const BREEDER_MANAGEMENT_ADMIN_BANNER_DOMAIN_PROVIDERS = [BreederManagementBannerResultMapperService];

const BREEDER_MANAGEMENT_ADMIN_BANNER_INFRASTRUCTURE_PROVIDERS = [
    BreederManagementAdminBannerRepository,
    BreederManagementAdminBannerReaderAdapter,
    BreederManagementAdminBannerWriterAdapter,
];

const BREEDER_MANAGEMENT_ADMIN_BANNER_PORT_BINDINGS = [
    {
        provide: BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT,
        useExisting: BreederManagementAdminBannerReaderAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
        useExisting: BreederManagementAdminBannerWriterAdapter,
    },
    {
        provide: GET_ACTIVE_PROFILE_BANNERS_QUERY,
        useExisting: GetActiveProfileBannersUseCase,
    },
    {
        provide: GET_ACTIVE_COUNSEL_BANNERS_QUERY,
        useExisting: GetActiveCounselBannersUseCase,
    },
];

export const BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_ADMIN_BANNER_USE_CASE_PROVIDERS,
    ...BREEDER_MANAGEMENT_ADMIN_BANNER_DOMAIN_PROVIDERS,
    ...BREEDER_MANAGEMENT_ADMIN_BANNER_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_MANAGEMENT_ADMIN_BANNER_PORT_BINDINGS,
];

// 외부(auth 배너 컨트롤러)에서 활성 프로필 배너 조회에 사용하는 Port 만 노출
export const BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_EXPORTS = [GET_ACTIVE_PROFILE_BANNERS_QUERY];
