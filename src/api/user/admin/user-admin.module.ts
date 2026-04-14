import { Module } from '@nestjs/common';

import {
    USER_ADMIN_MODULE_CONTROLLERS,
    USER_ADMIN_MODULE_IMPORTS,
    USER_ADMIN_MODULE_PROVIDERS,
} from './user-admin.module-definition';

/**
 * 사용자 관리 Admin 모듈
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 * - 프로필 배너 관리
 * - 전화번호 화이트리스트 관리
 */
@Module({
    imports: USER_ADMIN_MODULE_IMPORTS,
    controllers: USER_ADMIN_MODULE_CONTROLLERS,
    providers: USER_ADMIN_MODULE_PROVIDERS,
})
export class UserAdminModule {}
