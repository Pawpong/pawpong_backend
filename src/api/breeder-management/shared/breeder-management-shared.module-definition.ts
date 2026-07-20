import { StorageModule } from '../../../common/storage/storage.module';

import { BreederManagementFileUrlAdapter } from '../infrastructure/breeder-management-file-url.adapter';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../application/ports/breeder-management-file-url.port';

// 브리더 관리 도메인의 여러 슬라이스가 공유하는 공통 capability.
// 파일키 → CDN URL 변환(FILE_URL_PORT)은 profile/pets/verification/admin-banner 등에서 공통으로 쓰인다.
export const BREEDER_MANAGEMENT_SHARED_MODULE_IMPORTS = [StorageModule];

export const BREEDER_MANAGEMENT_SHARED_MODULE_PROVIDERS = [
    BreederManagementFileUrlAdapter,
    {
        provide: BREEDER_MANAGEMENT_FILE_URL_PORT,
        useExisting: BreederManagementFileUrlAdapter,
    },
];

export const BREEDER_MANAGEMENT_SHARED_MODULE_EXPORTS = [BREEDER_MANAGEMENT_FILE_URL_PORT];
