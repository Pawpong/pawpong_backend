import { Injectable } from '@nestjs/common';

import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

@Injectable()
export class AppVersionCommandResponseMessageService {
    appVersionCreated(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated;
    }

    appVersionUpdated(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated;
    }

    appVersionDeleted(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted;
    }
}
