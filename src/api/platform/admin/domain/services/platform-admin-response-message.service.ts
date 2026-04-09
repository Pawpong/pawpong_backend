import { Injectable } from '@nestjs/common';

import { PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/platform-admin-response-messages';

@Injectable()
export class PlatformAdminResponseMessageService {
    platformStatsRetrieved(): string {
        return PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformStatsRetrieved;
    }

    platformMvpStatsRetrieved(): string {
        return PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformMvpStatsRetrieved;
    }
}
