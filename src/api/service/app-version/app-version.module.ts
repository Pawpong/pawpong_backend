import { Module } from '@nestjs/common';

import {
    APP_VERSION_MODULE_CONTROLLERS,
    APP_VERSION_MODULE_IMPORTS,
    APP_VERSION_MODULE_PROVIDERS,
} from './app-version.module-definition';

/**
 * 앱 버전 관리 모듈
 * RN 앱의 강제/권장 업데이트 버전 정보 관리
 */
@Module({
    imports: APP_VERSION_MODULE_IMPORTS,
    controllers: APP_VERSION_MODULE_CONTROLLERS,
    providers: APP_VERSION_MODULE_PROVIDERS,
})
export class AppVersionModule {}
