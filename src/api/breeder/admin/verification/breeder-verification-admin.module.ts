import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederVerificationAdminController } from './breeder-verification-admin.controller';

import { BreederVerificationAdminService } from './breeder-verification-admin.service';

import { Admin, AdminSchema } from '../../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';

import { StorageModule } from '../../../../common/storage/storage.module';
import { NotificationModule } from '../../../notification/notification.module';

/**
 * 브리더 인증 관리자 모듈
 *
 * 관리자가 브리더 인증을 관리하는 기능을 제공합니다:
 * - 브리더 인증 승인/거절
 * - 브리더 목록 조회
 * - 승인 대기 브리더 목록 조회
 *
 * Note: MailTemplateService는 NotificationModule을 통해 제공받습니다.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        NotificationModule, // MailTemplateService도 여기서 제공됨
        StorageModule, // StorageService 제공
    ],
    controllers: [BreederVerificationAdminController],
    providers: [BreederVerificationAdminService],
    exports: [BreederVerificationAdminService],
})
export class BreederVerificationAdminModule {}
