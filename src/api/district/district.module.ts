import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DistrictController } from './district.controller';
import { DistrictAdminController } from './admin/district-admin.controller';

import { DistrictService } from './district.service';
import { DistrictAdminService } from './admin/district-admin.service';

import { District, DistrictSchema } from '../../schema/district.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])],
    controllers: [DistrictController, DistrictAdminController],
    providers: [DistrictService, DistrictAdminService],
    exports: [DistrictService, DistrictAdminService],
})
export class DistrictModule {}
