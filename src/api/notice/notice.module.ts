import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notice, NoticeSchema } from 'src/schema/notice.schema';
import { NoticeController } from './notice.controller';
import { NoticeAdminController } from './admin/notice-admin.controller';
import { NoticeService } from './notice.service';
import { NoticeAdminService } from './admin/notice-admin.service';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';

/**
 * 공지사항 모듈
 * 공지사항 관련 기능을 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }])],
    controllers: [NoticeController, NoticeAdminController],
    providers: [NoticeService, NoticeAdminService, CustomLoggerService],
    exports: [NoticeService, NoticeAdminService],
})
export class NoticeModule {}
