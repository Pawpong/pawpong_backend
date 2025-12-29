import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AlimtalkService } from './alimtalk.service';

import { AlimtalkTemplate, AlimtalkTemplateSchema } from '../../schema/alimtalk-template.schema';

/**
 * 카카오 알림톡 발송 모듈
 *
 * @description
 * CoolSMS(솔라피)를 통한 카카오 알림톡 발송 기능을 제공합니다.
 * Global 모듈로 설정되어 있어 별도 import 없이 AlimtalkService를 주입받을 수 있습니다.
 * 템플릿 정보는 MongoDB에서 관리됩니다.
 *
 * @example
 * // 서비스에서 사용
 * constructor(private readonly alimtalkService: AlimtalkService) {}
 *
 * // 알림톡 발송
 * await this.alimtalkService.sendBreederApproved('01012345678', '홍길동');
 *
 * @requires
 * 환경변수 설정 필요:
 * - COOLSMS_API_KEY: 솔라피 API 키
 * - COOLSMS_API_SECRET: 솔라피 API 시크릿
 * - COOLSMS_SENDER_PHONE: 발신번호
 * - KAKAO_CHANNEL_ID: 카카오 채널 ID (pfId)
 */
@Global()
@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: AlimtalkTemplate.name, schema: AlimtalkTemplateSchema }]),
    ],
    providers: [AlimtalkService],
    exports: [AlimtalkService],
})
export class AlimtalkModule {}
