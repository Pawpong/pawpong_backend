import { Module } from '@nestjs/common';

import {
    INQUIRY_MODULE_CONTROLLERS,
    INQUIRY_MODULE_IMPORTS,
    INQUIRY_MODULE_PROVIDERS,
} from './inquiry.module-definition';

/**
 * 문의 모듈
 * 입양자 질문 작성, 브리더 답변, 목록/상세 조회 기능 제공
 */
@Module({
    imports: INQUIRY_MODULE_IMPORTS,
    controllers: INQUIRY_MODULE_CONTROLLERS,
    providers: INQUIRY_MODULE_PROVIDERS,
})
export class InquiryModule {}
