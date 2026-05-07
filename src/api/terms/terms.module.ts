import { Module } from '@nestjs/common';

import { TERMS_MODULE_CONTROLLERS, TERMS_MODULE_IMPORTS, TERMS_MODULE_PROVIDERS } from './terms.module-definition';

/**
 * 약관 모듈
 * 가입/온보딩 화면의 약관 동의 흐름을 위한 활성 약관 조회 API 제공
 */
@Module({
    imports: TERMS_MODULE_IMPORTS,
    controllers: TERMS_MODULE_CONTROLLERS,
    providers: TERMS_MODULE_PROVIDERS,
})
export class TermsModule {}
