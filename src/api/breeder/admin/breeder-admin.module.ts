import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederAdminController } from './breeder-admin.controller';
import { BreederAdminService } from './breeder-admin.service';

import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';

import { StorageModule } from '../../../common/storage/storage.module';
import { MailModule } from '../../../common/mail/mail.module';
import { NotificationModule } from '../../../api/notification/notification.module';
import { AlimtalkModule } from '../../../common/alimtalk/alimtalk.module';

/**
 * 브리더 관리자 모듈
 *
 * 관리자가 브리더를 관리하는 기능을 제공합니다:
 * - 브리더 인증 승인/거절
 * - 브리더 목록 조회
 * - 브리더 정지
 * - 리마인드 알림 발송
 *
 * Note: 브리더 레벨 관리는 BreederLevelAdminModule로 분리됨
 * Note: 브리더 신고 관리는 향후 별도 모듈로 분리 예정
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
        AlimtalkModule,
    ],
    controllers: [BreederAdminController],
    providers: [BreederAdminService],
    exports: [BreederAdminService],
})
export class BreederAdminModule {}
