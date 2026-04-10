import { Injectable } from '@nestjs/common';

import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

@Injectable()
export class AppVersionAdminWriteResponseMessageService {
    appVersionCreated(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated;
    }

    appVersionUpdated(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated;
    }
}
