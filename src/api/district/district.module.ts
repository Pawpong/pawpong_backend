import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DistrictController } from './district.controller';
import { DistrictAdminCommandController } from './admin/district-admin-command.controller';
import { DistrictAdminQueryController } from './admin/district-admin-query.controller';

import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';
import { DISTRICT_READER_PORT } from './application/ports/district-reader.port';
import { DistrictOrderingService } from './domain/services/district-ordering.service';
import { DistrictAdminResultMapperService } from './domain/services/district-admin-result-mapper.service';
import { DistrictMongooseReaderAdapter } from './infrastructure/district-mongoose-reader.adapter';
import { DISTRICT_ADMIN_READER_PORT } from './admin/application/ports/district-admin-reader.port';
import { DISTRICT_WRITER_PORT } from './admin/application/ports/district-writer.port';
import { CreateDistrictUseCase } from './admin/application/use-cases/create-district.use-case';
import { GetAllDistrictsAdminUseCase } from './admin/application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './admin/application/use-cases/get-district-by-id-admin.use-case';
import { UpdateDistrictUseCase } from './admin/application/use-cases/update-district.use-case';
import { DeleteDistrictUseCase } from './admin/application/use-cases/delete-district.use-case';
import { DistrictMongooseAdminReaderAdapter } from './admin/infrastructure/district-mongoose-admin-reader.adapter';
import { DistrictMongooseWriterAdapter } from './admin/infrastructure/district-mongoose-writer.adapter';
import { DistrictRepository } from './repository/district.repository';

import { District, DistrictSchema } from '../../schema/district.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])],
    controllers: [DistrictController, DistrictAdminQueryController, DistrictAdminCommandController],
    providers: [
        GetAllDistrictsUseCase,
        CreateDistrictUseCase,
        GetAllDistrictsAdminUseCase,
        GetDistrictByIdAdminUseCase,
        UpdateDistrictUseCase,
        DeleteDistrictUseCase,
        DistrictOrderingService,
        DistrictAdminResultMapperService,
        DistrictRepository,
        DistrictMongooseReaderAdapter,
        DistrictMongooseAdminReaderAdapter,
        DistrictMongooseWriterAdapter,
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
    ],
})
export class DistrictModule {}
