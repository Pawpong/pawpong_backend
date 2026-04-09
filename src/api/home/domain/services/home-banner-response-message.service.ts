import { Injectable } from '@nestjs/common';

import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

@Injectable()
export class HomeBannerResponseMessageService {
    bannersRetrieved(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved;
    }

    bannerCreated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated;
    }

    bannerUpdated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated;
    }

    bannerDeleted(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted;
    }
}
