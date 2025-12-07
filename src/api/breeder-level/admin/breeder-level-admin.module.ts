import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederLevelAdminController } from './breeder-level-admin.controller';
import { BreederLevelAdminService } from './breeder-level-admin.service';

import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';

import { NotificationModule } from '../../notification/notification.module';

/**
 * 브리더 레벨 관리자 모듈
 *
 * 관리자가 브리더 레벨을 관리하는 기능을 제공합니다:
 * - 브리더 레벨 변경 (new ↔ elite)
 * - 브리더 레벨별 목록 조회
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        NotificationModule,
    ],
    controllers: [BreederLevelAdminController],
    providers: [BreederLevelAdminService],
    exports: [BreederLevelAdminService],
})
export class BreederLevelAdminModule {}
