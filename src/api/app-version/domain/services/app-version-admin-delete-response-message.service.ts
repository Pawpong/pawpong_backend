import { Injectable } from '@nestjs/common';

import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

@Injectable()
export class AppVersionAdminDeleteResponseMessageService {
    appVersionDeleted(): string {
        return APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted;
    }
}
