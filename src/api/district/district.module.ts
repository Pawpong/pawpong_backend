import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DistrictController } from './district.controller';
import { DistrictAdminController } from './admin/district-admin.controller';

import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';
import { DISTRICT_READER } from './application/ports/district-reader.port';
import { DistrictOrderingService } from './domain/services/district-ordering.service';
import { DistrictAdminPresentationService } from './domain/services/district-admin-presentation.service';
import { DistrictMongooseReaderAdapter } from './infrastructure/district-mongoose-reader.adapter';
import { DISTRICT_ADMIN_READER } from './admin/application/ports/district-admin-reader.port';
import { DISTRICT_WRITER } from './admin/application/ports/district-writer.port';
import { CreateDistrictUseCase } from './admin/application/use-cases/create-district.use-case';
import { GetAllDistrictsAdminUseCase } from './admin/application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './admin/application/use-cases/get-district-by-id-admin.use-case';
import { UpdateDistrictUseCase } from './admin/application/use-cases/update-district.use-case';
import { DeleteDistrictUseCase } from './admin/application/use-cases/delete-district.use-case';
import { DistrictMongooseAdminReaderAdapter } from './admin/infrastructure/district-mongoose-admin-reader.adapter';
import { DistrictMongooseWriterAdapter } from './admin/infrastructure/district-mongoose-writer.adapter';

import { District, DistrictSchema } from '../../schema/district.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])],
    controllers: [DistrictController, DistrictAdminController],
    providers: [
        GetAllDistrictsUseCase,
        CreateDistrictUseCase,
        GetAllDistrictsAdminUseCase,
        GetDistrictByIdAdminUseCase,
        UpdateDistrictUseCase,
        DeleteDistrictUseCase,
        DistrictOrderingService,
        DistrictAdminPresentationService,
        DistrictMongooseReaderAdapter,
        DistrictMongooseAdminReaderAdapter,
        DistrictMongooseWriterAdapter,
        {
            provide: DISTRICT_READER,
            useExisting: DistrictMongooseReaderAdapter,
        },
        {
            provide: DISTRICT_ADMIN_READER,
            useExisting: DistrictMongooseAdminReaderAdapter,
        },
        {
            provide: DISTRICT_WRITER,
            useExisting: DistrictMongooseWriterAdapter,
        },
    ],
})
export class DistrictModule {}
