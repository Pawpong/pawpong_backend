import { Module, Global } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';
import { CUSTOM_LOGGER_SERVICE_TOKEN } from './logger.token';

/**
 * 전역 로거 모듈
 *
 * CustomLoggerService를 전역으로 제공하여
 * 모든 모듈에서 별도 import 없이 사용할 수 있도록 합니다.
 */
@Global()
@Module({
    providers: [
        CustomLoggerService,
        {
            provide: CUSTOM_LOGGER_SERVICE_TOKEN,
            useExisting: CustomLoggerService,
        },
    ],
    exports: [CUSTOM_LOGGER_SERVICE_TOKEN, CustomLoggerService],
})
export class LoggerModule {}
