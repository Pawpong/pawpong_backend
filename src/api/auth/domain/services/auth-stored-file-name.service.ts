import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

@Injectable()
export class AuthStoredFileNameService {
    constructor(private readonly logger: CustomLoggerService) {}

    extract(urlOrFilename?: string): string | undefined {
        if (!urlOrFilename) {
            return urlOrFilename;
        }

        if (urlOrFilename.startsWith('http://') || urlOrFilename.startsWith('https://')) {
            try {
                const url = new URL(urlOrFilename);
                let pathname = url.pathname;
                if (pathname.startsWith('/')) {
                    pathname = pathname.substring(1);
                }

                this.logger.logWarning(
                    'AuthStoredFileNameService',
                    'URL에서 파일명을 추출했습니다. 가능하면 파일명 자체를 저장하세요.',
                    {
                        originalUrl: urlOrFilename,
                        extractedFileName: pathname,
                    },
                );

                return pathname;
            } catch (error) {
                this.logger.logError('AuthStoredFileNameService', 'URL 파싱 실패', error);
                return urlOrFilename;
            }
        }

        return urlOrFilename;
    }
}
