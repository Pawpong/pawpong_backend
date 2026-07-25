import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';

import { BreederManagementModule } from '../../breeder-management/breeder-management.module';
import { AdopterRepository } from '../repository/adopter.repository';
import { AdopterBreederFavoriteRepository } from '../repository/adopter-breeder-favorite.repository';
import { AdopterProfileAdapter } from '../infrastructure/adopter-profile.adapter';
import { AdopterBreederReaderAdapter } from '../infrastructure/adopter-breeder-reader.adapter';
import { AdopterFileUrlAdapter } from '../infrastructure/adopter-file-url.adapter';
import { ADOPTER_PROFILE_PORT } from '../application/ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../application/ports/adopter-breeder-reader.port';
import { ADOPTER_FILE_URL_PORT } from '../application/ports/adopter-file-url.port';
import { AdopterPaginationAssemblerService } from '../domain/services/adopter-pagination-assembler.service';

// 입양자 컨텍스트의 여러 슬라이스가 공유하는 기반.
// - 입양자 영속성(프로필·즐겨찾기 repository)
// - 본인 확인(ADOPTER_PROFILE_PORT) / 브리더 조회(ADOPTER_BREEDER_READER_PORT) / 파일 URL(ADOPTER_FILE_URL_PORT)
// - 목록 페이지네이션 조립
// 브리더 조회는 breeder-management 컨텍스트의 repository 를 어댑터가 감싸 Port 로만 노출한다.
const ADOPTER_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const ADOPTER_SHARED_MODULE_IMPORTS = [
    ADOPTER_SHARED_SCHEMA_IMPORTS,
    StorageModule,
    BreederManagementModule,
];

export const ADOPTER_SHARED_MODULE_PROVIDERS = [
    AdopterRepository,
    AdopterBreederFavoriteRepository,
    AdopterPaginationAssemblerService,
    AdopterProfileAdapter,
    AdopterBreederReaderAdapter,
    AdopterFileUrlAdapter,
    {
        provide: ADOPTER_PROFILE_PORT,
        useExisting: AdopterProfileAdapter,
    },
    {
        provide: ADOPTER_BREEDER_READER_PORT,
        useExisting: AdopterBreederReaderAdapter,
    },
    {
        provide: ADOPTER_FILE_URL_PORT,
        useExisting: AdopterFileUrlAdapter,
    },
];

export const ADOPTER_SHARED_MODULE_EXPORTS = [
    AdopterRepository,
    AdopterBreederFavoriteRepository,
    AdopterPaginationAssemblerService,
    ADOPTER_PROFILE_PORT,
    ADOPTER_BREEDER_READER_PORT,
    ADOPTER_FILE_URL_PORT,
    // 슬라이스 레포지토리가 Adopter/Breeder 모델을 주입받을 수 있도록 재노출
    MongooseModule,
    // 슬라이스 어댑터가 브리더 영속성(BreederRepository 등)에 접근할 수 있도록 재노출
    BreederManagementModule,
];
