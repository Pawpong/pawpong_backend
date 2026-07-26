import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewSchema } from '../../../../schema/breeder-review.schema';
import { ParentPet, ParentPetSchema } from '../../../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../../../schema/available-pet.schema';

import { BreederPublicRepository } from '../repository/breeder-public.repository';
import { BreederPublicReaderAdapter } from '../infrastructure/breeder-public-reader.adapter';
import { BreederFileUrlAdapter } from '../infrastructure/breeder-file-url.adapter';
import { BreederPaginationAssemblerService } from '../domain/services/breeder-pagination-assembler.service';
import { BreederBirthDateFormatterService } from '../domain/services/breeder-birth-date-formatter.service';
import { BREEDER_PUBLIC_READER_PORT } from '../application/ports/breeder-public-reader.port';
import { BREEDER_FILE_URL_PORT } from '../application/ports/breeder-file-url.port';

// 브리더 공개 조회 공통 기반 — 탐색(목록)과 상세 슬라이스가 함께 쓰는 읽기 Port.
const BREEDER_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: BreederReview.name, schema: BreederReviewSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const BREEDER_SHARED_MODULE_IMPORTS = [BREEDER_SHARED_SCHEMA_IMPORTS, StorageModule];

export const BREEDER_SHARED_MODULE_PROVIDERS = [
    BreederPublicRepository,
    BreederPublicReaderAdapter,
    BreederFileUrlAdapter,
    BreederPaginationAssemblerService,
    BreederBirthDateFormatterService,
    { provide: BREEDER_PUBLIC_READER_PORT, useExisting: BreederPublicReaderAdapter },
    { provide: BREEDER_FILE_URL_PORT, useExisting: BreederFileUrlAdapter },
];

export const BREEDER_SHARED_MODULE_EXPORTS = [
    BREEDER_PUBLIC_READER_PORT,
    BREEDER_FILE_URL_PORT,
    BreederPaginationAssemblerService,
    BreederBirthDateFormatterService,
];
