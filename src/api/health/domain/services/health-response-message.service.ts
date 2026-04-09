import { Injectable } from '@nestjs/common';

import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/health-response-messages';

@Injectable()
export class HealthResponseMessageService {
    healthChecked(): string {
        return HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked;
    }
}
