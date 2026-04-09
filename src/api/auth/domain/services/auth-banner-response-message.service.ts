import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthBannerResponseMessageService {
    getBannerListed(location: 'login' | 'signup'): string {
        return location === 'login'
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed;
    }
}
