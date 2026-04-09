import { Injectable } from '@nestjs/common';

import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

@Injectable()
export class HomeResponseMessageService {
    bannersRetrieved(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved;
    }

    faqsRetrieved(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqsRetrieved;
    }

    availablePetsRetrieved(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.availablePetsRetrieved;
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

    faqCreated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated;
    }

    faqUpdated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated;
    }

    faqDeleted(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted;
    }
}
