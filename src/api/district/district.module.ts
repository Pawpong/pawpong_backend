import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DistrictController } from './district.controller';
import { DistrictAdminController } from './admin/district-admin.controller';

import { DistrictAdminService } from './admin/district-admin.service';
import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';
import { DISTRICT_READER } from './application/ports/district-reader.port';
import { DistrictOrderingService } from './domain/services/district-ordering.service';
import { DistrictMongooseReaderAdapter } from './infrastructure/district-mongoose-reader.adapter';

import { District, DistrictSchema } from '../../schema/district.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])],
    controllers: [DistrictController, DistrictAdminController],
    providers: [
        GetAllDistrictsUseCase,
        DistrictOrderingService,
        DistrictMongooseReaderAdapter,
        DistrictAdminService,
        {
            provide: DISTRICT_READER,
            useExisting: DistrictMongooseReaderAdapter,
        },
    ],
    exports: [DistrictAdminService],
})
export class DistrictModule {}
