import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

const INTERNAL_ORIGIN = 'https://pawpong.internal';

@Injectable()
export class AuthSocialRedirectPathService {
    normalize(candidate: string | undefined): string | null {
        if (!candidate?.startsWith('/') || candidate.startsWith('//')) {
            return null;
        }

        try {
            const url = new URL(candidate, INTERNAL_ORIGIN);
            if (url.origin !== INTERNAL_ORIGIN) {
                return null;
            }

            return `${url.pathname}${url.search}${url.hash}`;
        } catch {
            return null;
        }
    }

    resolve(originUrl: string | undefined, logger: CustomLoggerService, isLocalLog: boolean): string {
        let redirectPath = '/explore';

        if (originUrl && originUrl.includes('|')) {
            const separatorIndex = originUrl.indexOf('|');
            const safePath = this.normalize(originUrl.slice(separatorIndex + 1));
            if (safePath) {
                redirectPath = safePath;
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
