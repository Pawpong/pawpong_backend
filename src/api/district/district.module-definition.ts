import { MongooseModule } from '@nestjs/mongoose';

import { District, DistrictSchema } from '../../schema/district.schema';

import { DistrictAdminCommandController } from './admin/district-admin-command.controller';
import { DistrictAdminQueryController } from './admin/district-admin-query.controller';
import { DISTRICT_ADMIN_READER_PORT } from './admin/application/ports/district-admin-reader.port';
import { DISTRICT_WRITER_PORT } from './admin/application/ports/district-writer.port';
import { CreateDistrictUseCase } from './admin/application/use-cases/create-district.use-case';
import { DeleteDistrictUseCase } from './admin/application/use-cases/delete-district.use-case';
import { GetAllDistrictsAdminUseCase } from './admin/application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './admin/application/use-cases/get-district-by-id-admin.use-case';
import { UpdateDistrictUseCase } from './admin/application/use-cases/update-district.use-case';
import { DistrictMongooseAdminReaderAdapter } from './admin/infrastructure/district-mongoose-admin-reader.adapter';
import { DistrictMongooseWriterAdapter } from './admin/infrastructure/district-mongoose-writer.adapter';
import { DistrictController } from './district.controller';
import { DISTRICT_READER_PORT } from './application/ports/district-reader.port';
import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';
import { DistrictAdminResultMapperService } from './domain/services/district-admin-result-mapper.service';
import { DistrictOrderingService } from './domain/services/district-ordering.service';
import { DistrictMongooseReaderAdapter } from './infrastructure/district-mongoose-reader.adapter';
import { DistrictRepository } from './repository/district.repository';

const DISTRICT_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }]);

export const DISTRICT_MODULE_IMPORTS = [DISTRICT_SCHEMA_IMPORTS];

export const DISTRICT_MODULE_CONTROLLERS = [
    DistrictController,
    DistrictAdminQueryController,
    DistrictAdminCommandController,
];

const DISTRICT_USE_CASE_PROVIDERS = [
    GetAllDistrictsUseCase,
    CreateDistrictUseCase,
    GetAllDistrictsAdminUseCase,
    GetDistrictByIdAdminUseCase,
    UpdateDistrictUseCase,
    DeleteDistrictUseCase,
];

const DISTRICT_DOMAIN_PROVIDERS = [DistrictOrderingService, DistrictAdminResultMapperService];

const DISTRICT_INFRASTRUCTURE_PROVIDERS = [
    DistrictRepository,
    DistrictMongooseReaderAdapter,
    DistrictMongooseAdminReaderAdapter,
    DistrictMongooseWriterAdapter,
];

const DISTRICT_PORT_BINDINGS = [
    {
        provide: DISTRICT_READER_PORT,
        useExisting: DistrictMongooseReaderAdapter,
    },
    {
        provide: DISTRICT_ADMIN_READER_PORT,
        useExisting: DistrictMongooseAdminReaderAdapter,
    },
    {
        provide: DISTRICT_WRITER_PORT,
        useExisting: DistrictMongooseWriterAdapter,
    },
];

export const DISTRICT_MODULE_PROVIDERS = [
    ...DISTRICT_USE_CASE_PROVIDERS,
    ...DISTRICT_DOMAIN_PROVIDERS,
    ...DISTRICT_INFRASTRUCTURE_PROVIDERS,
    ...DISTRICT_PORT_BINDINGS,
];
