import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

@Injectable()
export class AuthSocialRedirectPathService {
    resolve(originUrl: string | undefined, logger: CustomLoggerService, isLocalLog: boolean): string {
        let redirectPath = '/explore';

        if (originUrl && originUrl.includes('|')) {
            const parts = originUrl.split('|');
            if (parts.length > 1 && parts[1]) {
                redirectPath = parts[1];
                logger.log(
                    isLocalLog
                        ? `[processSocialLoginCallback] 추출된 redirectPath (localhost): ${redirectPath}`
                        : `[processSocialLoginCallback] 추출된 redirectPath: ${redirectPath}`,
                );
            }
        }

        return redirectPath;
    }
}
