import { Module } from '@nestjs/common';

import {
    ADOPTER_ACCOUNT_MODULE_CONTROLLERS,
    ADOPTER_ACCOUNT_MODULE_IMPORTS,
    ADOPTER_ACCOUNT_MODULE_PROVIDERS,
} from './adopter-account.module-definition';

/**
 * 입양자 > 신고·회원 탈퇴 슬라이스
 * - 브리더 신고 접수
 * - 입양자 계정 삭제
 */
@Module({
    imports: ADOPTER_ACCOUNT_MODULE_IMPORTS,
    controllers: ADOPTER_ACCOUNT_MODULE_CONTROLLERS,
    providers: ADOPTER_ACCOUNT_MODULE_PROVIDERS,
})
export class AdopterAccountModule {}
